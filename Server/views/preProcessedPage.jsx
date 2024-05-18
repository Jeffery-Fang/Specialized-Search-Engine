var React = require('react');

let serverURL = 'http://localhost:3000';

function Entry({url, title, score, pr, id, domain}){
  /*
    Component to display each search entry
  */

  return (
    <>
      <div className = "container-fluid border border-dark rounded">
        <div className = "vstack p-2">
          <a href = {serverURL + "/" + domain + "/" + id} className = "h5 row link-underline link-underline-opacity-0">
            {title}
          </a>
          <div className = "row">
            URL: {url}
          </div>
          <div className = "row">
            score: {score}
          </div>
          <div className = "row">
            page rank: {pr}
          </div>
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
      <div className = "p-2">
        <div className = "vstack gap-1">
          {searchResults}
        </div>
      </div>

      <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH" crossOrigin="anonymous"/>
    </>
  );
}

export default Results;
