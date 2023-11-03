import { useState } from 'react'

let serverURL = 'http://localhost:3000'

function Entry({url, title, score, pr, id, domain}){
  /*
    Component to display each search entry
  */

  return (
    <>
      <div className = "entry">
        <a href = {"http://localhost:3000/" + domain + "/" + id} className = "link">
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

function Search({handleSearch}){
  /*
    Component to display the search bar and toggles
  */

  return (
    <>
      <form id = "searchForm" onSubmit = {handleSearch} className = "searchBar">
        <label htmlFor = "search">
          <input type = "text" id = "search"/>
          <input type = "submit" value = "Search"/>
        </label>
        &nbsp;
        &nbsp;
        <label htmlFor = "network">
          <select id = "network" defaultValue = "fruit">
            <option value = "fruits" > Fruit </option>
            <option value = "personal"> Personal </option>
          </select>
        </label>
        &nbsp;
        Network
        <br />
        <label htmlFor = "boost">
          <input type = "checkbox" id = "boost" />
          Boost
        </label>
        &nbsp;
        &nbsp;
        <label htmlFor = "limit">
          <select id = "limit">
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
          &nbsp;
          Limit
        </label>
      </form>
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

    let query = e.target[0].value;
    let network = e.target[2].value;
    let boost = e.target[3].checked;
    let limit = e.target[4].value;

    console.log(query);
    console.log(network);
    console.log(boost);
    console.log(limit);

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
      <div>
        <Search handleSearch = {handleSearch}/>
        {searchResults}
      </div>
    </>
  );
}

export default App
