var React = require('react');

const entryStyle = {
    "textAlign": "left",
    "margin": "5px",
    "outlineStyle": "solid",
    "outlineColor": "black",
    "outlineWidth": "1px",
    "padding": "5px"
}

const linkStyle = {
    "color": "black",
    "textDecoration": "none"
}

function dataPage({url, title, pr, inLinks, outLinks, wordFrequency, content}){

    let inLinkEntries = inLinks.map((link) => {
        return(
            <div key = {link}>
                <a href = {link} style = {linkStyle}>{link}</a>
            </div>
        );
    });

    let outLinkEntries = outLinks.map((link) => {
        return(
            <div key = {link}>
                <a href = {link} style = {linkStyle}>{link}</a>
            </div>
        );
    });

    let wordTuples = [];
    let wordCount = 0;

    for(let word in wordFrequency){
        wordTuples.push([word, wordFrequency[word]]);
        wordCount += wordFrequency[word];
    }

    let wordEntries = wordTuples.map((word) => {

        let percent = word[1]/wordCount * 100;

        return (
            <div className = "col-auto border-start border-end" key = {word[0]}>
                {word[0]} : {word[1]} &nbsp; ({'~ ' + percent.toFixed(2) + '%'})
            </div>
        );
    });

    return (
        <>
            <div className = "container-fluid">
                <div className = "vstack gap-1">
                    <div className = "row">
                        <div className = "row display-5">
                            {title}
                        </div>
                        <div className = "lead">
                            General
                        </div>
                        <hr>
                        </hr>
                        <div className = "p-0">
                            URL: {url} <br/ >
                            Page Rank: {pr}
                        </div>
                    </div>
                    <div className = "row">
                        <div className = "lead px-2">
                            Text Content
                        </div>
                        <hr>
                        </hr>
                        <div className = "px-2">
                           {content}
                        </div>
                    </div>
                    <div className = "row">
                        <div className = "lead px-2">
                            Word Frequency
                        </div>
                        <hr>
                        </hr>
                        <div className = "container-fluid row d-flex">
                            {wordEntries}
                        </div>
                    </div>
                </div>
                <div className = "row gap-1 pt-5">
                    <div className = "col text-center border rounded">
                        <h5>
                            {"incoming links (" + inLinks.length + ")"} 
                        </h5>
                        {inLinkEntries}
                    </div>
                    <div className = "col text-center border rounded">
                        <h5>
                            {"outgoing links (" + outLinks.length + ")"} 
                        </h5>
                        {outLinkEntries}
                    </div>
                </div>
            </div>
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH" crossOrigin="anonymous"/>
        </>
    );
}

module.exports = dataPage;