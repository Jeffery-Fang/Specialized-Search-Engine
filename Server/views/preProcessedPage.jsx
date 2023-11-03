var React = require('react');

const entry = {
  "textAlign": "left",
  "margin": "5px",
  "outlineStyle": "solid",
  "outlineColor": "black",
  "outlineWidth": "1px",
}

const link = {
  "color": "black",
  "textDecoration": "none",
  "fontSize": "20px"
}

let serverURL = 'http://134.117.129.37:3000'

function Entry({url, title, score, pr, id, domain}){
  /*
    Component to display each search entry
  */

  return (
    <>
      <div className = "entry" style = {entry}>
        <a href = {serverURL + domain + "/" + id} className = "link" style = {link}>
          {title}
        </a>
        <div>
          URL: {url} <br />
          score: {score} <br />
          page rank: {pr} <br />
        </div>
      </div>
    </>
  );
}

function Results(props){
  /*
    Component to display the whole page
  */

  let results = props.preProcessedResults;
  let domain = props.domain;

  let searchResults = results.map(
    (item) => {
      return <Entry url = {item.url} title = {item.title} score = {item.score} pr = {item.pr} key = {item.url + item.id} id = {item.id} domain = {domain}/>
    }
  );

  return (
    <>
      <div>
        <b style = {link}> Results: </b> <br />
        {searchResults}
      </div>
    </>
  );
}

export default Results;
