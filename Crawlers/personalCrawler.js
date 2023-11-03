const Crawler = require('crawler');
const mongoose = require('mongoose');
const PPage = require('./models/PPageModel.js');
const PEdge = require('./models/PEdgeModel.js');
const config = require('./config.js');

let db;
let seed = 'https://en.wikipedia.org/wiki/PageRank';
let domain = 'https://en.wikipedia.org';
let pageNum = 0;
let pageLimit;

//open a connection to the database
mongoose.set("strictQuery", false);
mongoose.connect(config.db.host, {useNewUrlParser: true, useUnifiedTopology: true});

db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));

db.once('open', function(err){
    /*
        set the page limit and queue the seed URL when the database connection opens
    */

    console.log("Connected to the database...");

    if(process.argv[2] == "test"){
        pageLimit = 50;
    }else{
        pageLimit = 500;
    }

    c.queue(seed);
});

//close the connection with ctrl+c
process.on('SIGINT', function() {
    mongoose.connection.close().then(
        () => {
            console.log("Mongoose disconnected through app termination");
            process.exit(0);
        }
    );
});

const c = new Crawler({
    maxConnections : 10,
    callback: async (err, res, done) => {
        if(err){
            console.log(err);
        }else{
            /*
                When each page is crawled we collect the first 200 characters of the
                text as the content. Then we create a page in the database if it doesn't
                exist already. We then process the links on the page so that we are left
                with only the first 10 links that start with /wiki/. Then we create a edge
                in the database for each link and queue those links. This is repeated until
                we reach the page limit. 
            */

            console.log("Page# :", pageNum);

            if(pageNum <= pageLimit){
                let $ = res.$;
                let links = $("a");
                let crawlingLink = res.options.uri;
                let paragraphs = $("p");
                let content = "";
                let title = $("title").text();

                $(paragraphs).each(function(i, paragraph){
                    if(content.length < 200){
                        content += $(paragraph).text();
                    }
                });

                let newPage = {
                    url: crawlingLink,
                    title: title,
                    content: content,
                    id: -1,
                    wordFrequency: contentToWordFrequency(content)
                }

                await PPage.find({url: crawlingLink}).then(
                    async (results) => {
                        if(results.length == 0){
                            await PPage.create(newPage).then(
                                () => {
                                    pageNum += 1
                                }
                            ).catch(
                                () => {
                                    console.log("there was a error creating the page");
                                }
                            )
                        }
                    }
                );

                let tempList = [];

                $(links).each(async function(i, link){
                    let tempLink = $(link).attr('href');

                    if(tempLink){
                        if(!tempList.includes(domain + $(link).attr('href')) && tempLink.slice(0,6) == "/wiki/" && tempLink.length < 20){
                            let currentLink = domain + $(link).attr('href');
                            if(currentLink != crawlingLink){
                                tempList.push(currentLink);
                            }
                        }
                    }
                });

                tempList = tempList.slice(0,10);

                for(currentLink of tempList){
                    await PEdge.find({from: crawlingLink, to: currentLink}).then(   
                        (results) => {
                            if(results.length == 0){
                                let newEdge = {
                                    from: crawlingLink,
                                    to: currentLink
                                }
        
                                PEdge.create(newEdge).catch(
                                    () => {
                                        console.log("there was a error creating the edge");
                                    }
                                );
                            }
                            c.queue(currentLink);
                        } 
                    ).catch(
                        () => {
                            console.log("there was a error finding the edge");
                        }
                    );
                }
            }else{
                console.log("Page limit reached");
                return;
            }
            
        }
        done();
    },
    skipduplicates: true
})

c.on('drain', () => {
    console.log("Queue Empty");
});

function contentToWordFrequency(content){
    /*
        A function for removing punctutation and counting the number of 
        times are word occurs in the content
    */

    let words = content.replaceAll(".","").replaceAll(",","").replaceAll("?","").replaceAll("!","").replaceAll("\n", " ").split(" ")
    .filter((word) => {return word != ""});

    let out = {} 

    for(word of words){
        if(out[word] != undefined){
            out[word] += 1
        }else{
            out[word] = 1
        }
    }
    
    return out;
}
