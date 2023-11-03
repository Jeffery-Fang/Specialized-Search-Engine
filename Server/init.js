const mongoose = require('mongoose');
const FPage = require('./models/FPageModel.js');
const FEdge = require('./models/FEdgeModel.js');
const PPage = require('./models/PPageModel.js');
const PEdge = require('./models/PEdgeModel.js');
const config = require('./config.js');
const {Matrix} = require('ml-matrix');
const calcs = require('./pageRankCalculations.js');

let db;

mongoose.set("strictQuery", false);
mongoose.connect(config.db.host, {useNewUrlParser: true, useUnifiedTopology: true});

db = mongoose.connection;

db.once('open', async function(err){
    /*
        On connection to the database calculate the page rank for the fruit network
        and update each page in the database to have a pagerank. Then ID each page in 
        the personal network and calculate the page rank for those pages. Finally
        save the update the pages in the personal network to have page ranks as well.
    */

    console.log("creating adjacency matrix for fruit network...");

    await FPage.find({}).then(
        async (pages) => {
            let N = pages.length;
            let probabilityMatrix = Matrix.zeros(N,N);

            for(page of pages){
                await FEdge.find({to: page.url}).then(
                    async (edges) => {
                        for(edge of edges){
                            await FPage.findOne({url: edge.from}).then(
                                (result) => {
                                    probabilityMatrix.set(result.id, page.id, 1);
                                }
                            ).catch()
                        }
                    }
                ).catch();
            }

            console.log("calculating page rank for fruit network...");

            let pageRank = calcs.calculatePageRank(probabilityMatrix, N, 0.1);

            for(let i = 0; i < N; i++){
                await FPage.updateOne({id: i}, {pr: pageRank.get(0,i)});
            }

            console.log("page rank calculated for fruit network");

            await PPage.find({}).then(
                async (pages) => {
                    console.log("IDing pages for the personal network...");
                    
                    for(page of pages){
                        await PPage.updateOne({_id: page._id}, {id: pages.indexOf(page)});
                    }
                }
            ).catch();

            console.log("creating adjacency matrix for personal network...");

            await PPage.find({}).then(
                async (pages) => {
                    N = pages.length;
                    probabilityMatrix = Matrix.zeros(N,N);
                    
                    for(page of pages){
                        await PEdge.find({to: page.url}).then(
                            async (edges) => {
                                for(edge of edges){
                                    await PPage.findOne({url: edge.from}).then(
                                        (result) => {
                                            if(result != null && result.length != 0){
                                                probabilityMatrix.set(result.id, page.id, 1);
                                            }
                                        }
                                    ).catch()
                                }
                            }
                        ).catch();
                    }

                    console.log("calculating page rank for personal network...");

                    pageRank = calcs.calculatePageRank(probabilityMatrix, N, 0.1);

                    for(let i = 0; i < N; i++){
                        await PPage.updateOne({id: i}, {pr: pageRank.get(0,i)});
                    }

                    console.log("page rank calculated for personal network");

                    mongoose.connection.close().then(
                        () => {
                            console.log("database has been initialized");
                            process.exit(0);
                        }
                    );
                }
            ).catch();
        }
    ).catch();
});