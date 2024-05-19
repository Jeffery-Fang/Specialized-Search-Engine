<h3>
    About The Project
</h3>

---

A search engine that provides results from pages that I've crawled beforehand. The results are based on the internal scoring of elasticlunr as well as the page rank of the page.

### Prerequisite

The search engine uses a database that you will not have access to so in order to use it your will need a mongoDB atlas database of your own and will need to put the password and database name into config.js. 

## Installation

1. Clone this repository
    ```sh
    git clone https://github.com/Jeffery-Fang/Specialized-Search-Engine.git
    ```

2. Install NPM packages
    ```sh
    npm install
    ```

3. Change values in config.js to be the corresponding ones for your database
    ```sh
    const password = 'yourDBpassword';
    const dbname = 'yourDBname';
    ```

4. First you want to crawl some pages so go to personalCrawler.js and change seed and domain to corresponding values for where ever you want to start the crawl and change limit to the number of pages you want crawled.
    ```sh
    node personalCrawler.js
    ```  

5. After the crawler has finished running you'll want to run init.js to index and calculate the pagerank for each page.
    ```sh
    node init.js
    ``` 

6. When everything is ready you just have to start the server and got to localhost:3000 to access the search engine.
    ```sh
    node server.js
    ```
## Gallery & Demonstrations

![Screenshot 2024-05-18 230719](https://github.com/Jeffery-Fang/Specialized-Search-Engine/assets/126544955/4173130c-9055-462d-9dee-0a4bd9a9049a)

*Search screen with results*
<br />

![Screenshot 2024-05-18 230831](https://github.com/Jeffery-Fang/Specialized-Search-Engine/assets/126544955/6bbf3056-9ec9-479f-a631-da9e1908d915)

*Info page for a particular result*
<br />

https://github.com/Jeffery-Fang/Specialized-Search-Engine/assets/126544955/fbfde4dc-09f2-413c-b4e7-29b5a966600a

*Video Demonstration*
<br />

## Tools & Technologies

- MongoDB Atlas
- Express
- React
- Node
- Vite
- Elasticlunr
- Crawler






