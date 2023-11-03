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

function dataPage({url, title, pr, inLinks, outLinks, wordFrequency}){

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
            <div key = {word[0]}>
                {word[0]} : {word[1]} &nbsp; <b>({'~ ' + percent.toFixed(2) + '%'})</b>
            </div>
        );
    });

    return (
        <>
            <div style = {entryStyle}>
                URL: {url} <br />
                title: {title} <br />
                page rank: {pr} <br /> <br />
                <b>word frequency ({wordTuples.length}): <br /></b>
                {wordEntries}
            </div>
            <br />
            <div style = {entryStyle}>
                <b>in links ({inLinks.length}): <br /></b>
                {inLinkEntries}
            </div>
            <br />
            <div style = {entryStyle}>
                <b>out links ({outLinks.length}): <br /></b>
                {outLinkEntries}
            </div>
        </>
    );
}

module.exports = dataPage;