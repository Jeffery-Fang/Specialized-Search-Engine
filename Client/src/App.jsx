import { useState } from 'react'

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

function Search({handleSearch}){
  /*
    Component to display the search bar and toggles
  */

  return (
    <>
      <div className = "container-fluid row">
        <form className = "px-0 col-auto form-floating" onSubmit = {handleSearch}>
          <div className = "input-group">
            <div className = "input-group-text">
              &#x1F50E;&#xFE0E;
            </div>
            <input className = "form-control rounded" type = "text" autoComplete = "on" id = "search">
            </input>
            <input type = "submit" hidden = {true}>
            </input>
          </div>
        </form>
        <div className = "col-auto">
          <select className = "form-select" defaultValue = "personal" id = "network">
            <option value = "fruits" > Fruit </option>
            <option value = "personal"> Personal </option>
          </select>
        </div>
        <div className = "col-auto px-0">
          <select className = "form-select" id = "limit" defaultValue = "10">
            <option value = "1"> 1 </option>
            <option value = "5"> 5 </option>
            <option value = "10"> 10 </option>
            <option value = "15"> 15 </option>
            <option value = "20"> 20 </option>
            <option value = "25"> 25 </option>
            <option value = "30"> 30 </option>
            <option value = "35"> 35 </option>
            <option value = "40"> 40 </option>
            <option value = "45"> 45 </option>
            <option value = "50"> 50 </option>
          </select>
        </div>
        <div className = "form-check pt-1">
          <input className = "form-check-input" type = "checkbox" id = "boost">
          </input>
          <label className = "form-check-label" htmlFor = "boost">
            Boost
          </label>
        </div>
      </div>
    </>
  );
}

function App(){
  /*
    Component to display the whole page
  */
  const [results, setResults] = useState([]);
  const [domain, setDomain] = useState("fruits");

    let searchResults = results.map(
      (item) => {
        return <Entry url = {item.url} title = {item.title} score = {item.score} pr = {item.pr} key = {item.url + item.id} id = {item.id} domain = {domain}/>
      }
    );

  async function handleSearch(e){
    e.preventDefault();

    let query = document.getElementById("search").value;
    let network = document.getElementById("network").value;
    let boost = document.getElementById("boost").checked;
    let limit = document.getElementById("limit").value;

    let requestURL = serverURL + "/" + network + "?" + "q=" + query + "&" + "boost=" + boost + "&" + "limit=" + limit;

    console.log(requestURL);
    
    let options = {
      method: "GET",
      headers: new Headers({'Accept': 'application/json'}),
      mode: 'cors'
    };

    let response = await fetch(requestURL, options);
    let results = await response.json();

    console.log(results);

    setResults(results);
    setDomain(network);
  }

  return (
    <>
      <div className = "p-2">
        <Search handleSearch = {handleSearch}/>
        <div className = "vstack gap-1">
          {searchResults}
        </div>
      </div>
    </> 
  );
}

export default App
