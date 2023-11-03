const elasticlunr = require("elasticlunr");
const mongoose = require('mongoose');
const express = require('express');
const app = express();
const FPage = require('./models/FPageModel.js');
const FEdge = require('./models/FEdgeModel.js');
const PPage = require('./models/PPageModel.js');
const PEdge = require('./models/PEdgeModel.js');
const config = require('./config.js');
const PORT = process.env.PORT || 3000;

let db;
app.locals.db = db;

//serves static resources
app.use(express.static('./dist'));

mongoose.set("strictQuery", false);
mongoose.connect(config.db.host, {useNewUrlParser: true, useUnifiedTopology: true});

db = mongoose.connection;

//parses query string
app.use(express.urlencoded({extended: true}));

//display method and url for each request
app.use((req,_,next)=> {
    console.log(`${req.method}: ${req.url}`); 
    if (Object.keys(req.body).length > 0){
        console.log('Body:');
        console.log(req.body);
    }
    next();
});

//fixes CORS erros
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    next();
});

//set up indexes
const fruitIndex = elasticlunr(function(){
    this.addField('title');
    this.addField('content');
    this.setRef('id');
});

const personalIndex = elasticlunr(function(){
    this.addField('title');
    this.addField('content');
    this.setRef('id');
});

//set up react views
app.set('views', __dirname + '/views');                           
app.set('view engine', 'jsx');
app.engine('jsx', require('express-react-views').createEngine());

db.on('error', console.error.bind(console, 'connection error:'));

db.once('open', async function(err){
    /*
        Build the index when the server starts
    */

    console.log("initializing index...");

    await FPage.find({}).then(
        (pages) => {
            for(page of pages){
                fruitIndex.addDoc({
                    id: page.id,
                    title: page.title,
                    content: page.content
                });
            }
        }
    ).catch();

    await PPage.find({}).then(
        (pages) => {
            for(page of pages){
                personalIndex.addDoc({
                    id: page.id,
                    title: page.title,
                    content: page.content
                });
            }
        }
    ).catch();

    console.log("index initialized");
});

app.get("/top25", function(req, res){
    /*
        Handles GET requests to /top25

        Status Code:
            - 200 if top 25 pages were found successfully
            - 400 if there is an error

        Response:
            - returns the top 25 pages based on page rank
    */

    FPage.find({}).sort({pr: -1}).limit(25).then(
        (results) => {
            let out = [];

            for(result of results){
                out.push(
                    {
                        "link": result.url,
                        "pagerank": result.pr
                    }
                );
            }

            res.status(200).json(out);
            return;
        }
    ).catch(
        () => {
            res.status(400).send("there was an error");
            return;
        }
    );
});

app.get("/fruits", async function(req, res){
    /*
        Handles GET request to /fruits with a query string containing the query and other
        options

        Status Code:
            - 200 if the search is successful
            - 400 if there is an error
        
        Response:
            - returns an array of objects representing webpages

        Search the index first to get the initial results. Then query the database to
        get all the page information for each page from the index results. For each 
        relevant page push some data into the out array. If by the end the out array
        is longer than the limit specified, then sort by total score and slice off the
        extra elements. If the out array is too short then get more results that aren't
        already in the out array. This is the process whether the query is boosted or
        not but the order is different. The accept header is then checked to determine 
        the output.
    */
   
    let q = (req.query.q != undefined) ? req.query.q : "";
    let boost = (req.query.boost == "true") ? true : false;
    let limit = (req.query.limit == undefined || req.query.limit < 1 || req.query.limit > 50) ? 10 : parseInt(req.query.limit);
    let out = [];

    let indexResults = fruitIndex.search(q, {
        expand: true
    });

    if(boost){
        let currentIDs = [];

        await FPage.find({}).then(
            (pages) => {
                let ids = indexResults.map((item) => {return parseInt(item.ref)});

                for(page of pages){
                    if(ids.includes(page.id)){
                        let score = -1;

                        for(result of indexResults){
                            if(result.ref == page.id){
                                score = result.score;
                                break;
                            }
                        }

                        out.push({
                            name: "Jeffery Fang",
                            url: page.url,
                            title: page.title,
                            score: score * page.pr,
                            pr: page.pr,
                            id: page.id
                        });

                        currentIDs.push(page.id);
                    }
                }
            }
        ).catch();

        if(out.length > limit){
            out.sort((item1, item2) => {
                return item2.score - item1.score
            });

            out = out.slice(0,limit);
        }else{
            await FPage.find({id: {$nin: currentIDs}}).limit(limit - out.length).then(
                (pages) => {
                    for(page of pages){
                        out.push({
                            name: "Jeffery Fang",
                            url: page.url,
                            title: page.title,
                            score: 0,
                            pr: page.pr,
                            id: page.id
                        });
                    }

                    out.sort((item1, item2) => {
                        return item2.score - item1.score
                    });
                }
            ).catch();
        }
    }else{
        let currentIDs = [];

        if(indexResults.length > limit){
            indexResults = indexResults.slice(0,limit);
        }

        for(result of indexResults){
            await FPage.findOne({id: result.ref}).then(
                (page) => {
                    out.push({
                        name: "Jeffery Fang",
                        url: page.url,
                        title: page.title,
                        score: result.score,
                        pr: page.pr,
                        id: page.id
                    });

                    currentIDs.push(page.id);
                }
            ).catch();
        }

        if(indexResults.length < limit){
            await FPage.find({id: {$nin: currentIDs}}).limit(limit - indexResults.length).then(
                (pages) => {
                    for(page of pages){
                        out.push({
                            name: "Jeffery Fang",
                            url: page.url,
                            title: page.title,
                            score: 0,
                            pr: page.pr,
                            id: page.id
                        });
                    }
                }
            ).catch();
        }

        out.sort((item1, item2) => {return item2.score - item1.score});
    }

    res.format({
        'html' : () => {
            res.status(200).render("preProcessedPage", {preProcessedResults: out, domain: "/fruits"});
        },

        'json' : () => {
            res.status(200).json(out);
        } 
    });
});

app.get("/fruits/:id", async function(req, res){
    /*
        Handles GET request to /fruits/:id 

        Status Code:
            - 200 if the datapage is sent successfully
            - 400 if there is an error
        
        Response:
            - returns a datapage rendered with information about the specified item

        Get the data associated with the id provided and calculated the incoming links
        and outgoing links for the page. Then render the data page and return it.
    */

    FPage.findOne({id: req.params.id}).then(
        async (page) => {
            
            let url = page.url;
            let title = page.title;
            let pr = page.pr;
            let wordFrequency = page.wordFrequency;
            let inLinks = await FEdge.find({to: page.url}).then(
                (edges) => {
                    let out = edges.map((edge) => {return edge.from});

                    return out;
                }
            )

            let outLinks = await FEdge.find({from: page.url}).then(
                (edges) => {
                    let out = edges.map((edge) => {return edge.to});

                    return out;
                }
            )
            
            res.render("dataPage", {url: url, title: title, pr: pr, inLinks: inLinks, outLinks: outLinks, wordFrequency: wordFrequency});
        }
    ).catch();
});

app.get("/personal", async function(req, res){
    /*
        Handles GET request to /personal with a query string containing the query and other
        options

        Status Code:
            - 200 if the search is successful
            - 400 if there is an error
        
        Response:
            - returns an array of objects representing webpages

        Search the index first to get the initial results. Then query the database to
        get all the page information for each page from the index results. For each 
        relevant page push some data into the out array. If by the end the out array
        is longer than the limit specified, then sort by total score and slice off the
        extra elements. If the out array is too short then get more results that aren't
        already in the out array. This is the process whether the query is boosted or
        not but the order is different. The accept header is then checked to determine 
        the output.
    */

    let q = (req.query.q != undefined) ? req.query.q : "";
    let boost = (req.query.boost == "true") ? true : false;
    let limit = (req.query.limit == undefined || req.query.limit < 1 || req.query.limit > 50) ? 10 : parseInt(req.query.limit);
    let out = [];

    let indexResults = personalIndex.search(q, {
        expand: true
    });

    if(boost){
        let currentIDs = [];

        await PPage.find({}).then(
            (pages) => {
                let ids = indexResults.map((item) => {return parseInt(item.ref)});

                for(page of pages){
                    if(ids.includes(page.id)){
                        let score = -1;

                        for(result of indexResults){
                            if(result.ref == page.id){
                                score = result.score;
                                break;
                            }
                        }

                        out.push({
                            name: "Jeffery Fang",
                            url: page.url,
                            title: page.title,
                            score: score * page.pr,
                            pr: page.pr,
                            id: page.id
                        });

                        currentIDs.push(page.id);
                    }
                }
            }
        ).catch();

        if(out.length > limit){
            out.sort((item1, item2) => {
                return item2.score - item1.score
            });

            out = out.slice(0,limit);
        }else{
            await PPage.find({id: {$nin: currentIDs}}).limit(limit - out.length).then(
                (pages) => {

                    for(page of pages){
                        out.push({
                            name: "Jeffery Fang",
                            url: page.url,
                            title: page.title,
                            score: 0,
                            pr: page.pr,
                            id: page.id
                        });
                    }

                    out.sort((item1, item2) => {
                        return item2.score - item1.score
                    });
                }
            ).catch();
        }
    }else{
        let currentIDs = [];

        if(indexResults.length > limit){
            indexResults = indexResults.slice(0,limit);
        }

        for(result of indexResults){
            await PPage.findOne({id: result.ref}).then(
                (page) => {
                    out.push({
                        name: "Jeffery Fang",
                        url: page.url,
                        title: page.title,
                        score: result.score,
                        pr: page.pr,
                        id: page.id
                    });

                    currentIDs.push(page.id);
                }
            ).catch();
        }

        if(indexResults.length < limit){
            await PPage.find({id: {$nin: currentIDs}}).limit(limit - indexResults.length).then(
                (pages) => {
                    for(page of pages){
                        out.push({
                            name: "Jeffery Fang",
                            url: page.url,
                            title: page.title,
                            score: 0,
                            pr: page.pr,
                            id: page.id
                        });
                    }
                }
            ).catch();
        }

        out.sort((item1, item2) => {return item2.score - item1.score});
    }

    res.format({
        'html' : () => {
            res.status(200).render("preProcessedPage", {preProcessedResults: out, domain: "/personal"});
        },

        'json' : () => {
            res.status(200).json(out);
        } 
    });
});

app.get("/personal/:id", async function(req, res){
    /*
        Handles GET request to /personal/:id 

        Status Code:
            - 200 if the datapage is sent successfully
            - 400 if there is an error
        
        Response:
            - returns a datapage rendered with information about the specified item

        Get the data associated with the id provided and calculated the incoming links
        and outgoing links for the page. Then render the data page and return it.
    */

    PPage.findOne({id: req.params.id}).then(
        async (page) => {
            
            let url = page.url;
            let title = page.title;
            let pr = page.pr;
            let wordFrequency = page.wordFrequency;
            let inLinks = await PEdge.find({to: page.url}).then(
                (edges) => {
                    let out = edges.map((edge) => {return edge.from});

                    return out;
                }
            )

            let outLinks = await PEdge.find({from: page.url}).then(
                (edges) => {
                    let out = edges.map((edge) => {return edge.to});

                    return out;
                }
            )
            
            res.render("dataPage", {url: url, title: title, pr: pr, inLinks: inLinks, outLinks: outLinks, wordFrequency: wordFrequency});
        }
    ).catch();
});

//close the connection with ctrl+c
process.on('SIGINT', function(){
    mongoose.connection.close().then(
        () => {
            console.log("Mongoose disconnected through app termination");
            process.exit(0);
        }
    );
    process.exit(0);
});

console.log("server started on port: ", PORT);
app.listen(PORT);

