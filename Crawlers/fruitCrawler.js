const Crawler = require('crawler');
const mongoose = require('mongoose');
const FPage = require('./models/FPageModel.js');
const FEdge = require('./models/FEdgeModel.js');
const config = require('./config.js');

let db;
let pageNum = 0;
let pageLimit = 1000;

let seed;
let domain;

//open a connection to the database
mongoose.set("strictQuery", false);
mongoose.connect(config.db.host, {useNewUrlParser: true, useUnifiedTopology: true});

db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));

db.once('open', function(err){
    /*
        set the seed URL and domain when the database connection opens
    */

    console.log("Connected to the database...");

    if(process.argv[2] == "test"){
        seed = 'https://people.scs.carleton.ca/~davidmckenney/tinyfruits/N-0.html';
        domain = 'https://people.scs.carleton.ca/~davidmckenney/tinyfruits/';
    }else{
        seed = 'https://people.scs.carleton.ca/~davidmckenney/fruitgraph/N-0.html';
        domain = 'https://people.scs.carleton.ca/~davidmckenney/fruitgraph/';
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
    maxConnections : 1,
    callback: async (err, res, done) => {
        if(err){
            console.log(err);
        }else{
            /*
                When each page is crawled we collect the paragraph elements content
                as the page content. Then we create a page in the database with the
                URL, title, content, id and word frequency. We then process all the 
                links on the page so we get usuable URLs and create a edge in the 
                if one doesn't already exist and finally we queue those links. This
                is repeated until we reach the page limit or the network if fully 
                crawled.
            */

            console.log("Page# :", pageNum);

            if(pageNum <= pageLimit){
                let $ = res.$;
                let links = $("a");
                let crawlingLink = res.options.uri;
                let content = $("p").text();
                let title = $("title").text();

                let newPage = {
                    url: crawlingLink,
                    title: title,
                    content: content,
                    id: pageNum,
                    wordFrequency: contentToWordFrequency(content)
                }

                await FPage.create(newPage).then(
                    () => {
                        pageNum += 1
                    }
                ).catch(
                    () => {
                        console.log("there was a error creating the page");
                    }
                )

                $(links).each(async function(i, link){
                    let currentLink = domain + $(link).attr('href').slice(2);

                    await FEdge.find({from: crawlingLink, to: currentLink}).then(
                        (results) => {
                            if(results.length == 0){
                                let newEdge = {
                                    from: crawlingLink,
                                    to: currentLink
                                }

                                FEdge.create(newEdge).catch(
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
                });
            }else{
                console.log("Page limit reached");
                return;
            }
        }
        done();
    },
    skipDuplicates: true
});

c.on('drain', () => {
    console.log("Queue empty");
    console.log(c.queueSize);
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