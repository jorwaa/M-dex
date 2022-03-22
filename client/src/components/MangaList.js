import './style/MangaList.css';

import React from "react";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faArrowLeft, faArrowRight } from '@fortawesome/free-solid-svg-icons';

import MangaElement from "./MangaElement";

/**
 * A generic List element that given the response of a
 * '/api/mangas' API call, displays the response data as 
 * a list of 'MangaElement'-objects
 */
class MangaList extends React.Component {
    constructor(props) {
        super(props);
        library.add(faArrowLeft);
        library.add(faArrowRight);

        this.state = {
            mangas: {
                result: "ok",
                limit: 0,
                offset: 0,
                total: 0,
                errors: [],
                data: [],
            },
            queryParams: this.props.queryParams,
        }

        this.setQueryParams = this.setQueryParams.bind(this);
        this.updateQueryParams = this.updateQueryParams.bind(this);

        this.fetchMangaList = this.fetchMangaList.bind(this);
        this.paramsToQuery = this.paramsToQuery.bind(this);
        this.parseArrayParam = this.parseArrayParam.bind(this);
        this.parseObjectParam = this.parseObjectParam.bind(this);

        this._nextPage = this._nextPage.bind(this);
        this._prevPage = this._prevPage.bind(this);




    }
    
    /**
     * If the prop 'queryParams' is set,
     * do an API call to the '/api/mangas' with these parameters
     */
    setQueryParams() {
        var queryParams = {};
        Object.entries(this.props.queryParams).map(entry => {
            const [key, value] = entry;
            queryParams[key] = value;
        })

        this.setState({
            queryParams: queryParams
        }, this.fetchMangaList())
    }

    /**
     * Does an asynchronous GET call to the '/api/mangas' API,
     * and when a response is given, parses the response body
     * to the 'MangaList' element's state
     */
    fetchMangaList() {
        console.log("Fetching latest mangas...");
        let listQuery = this.paramsToQuery()
        //fetch(`/api/mangas?offset=${this.state.offset}&limit=${this.state.limit}`)
        console.log("URL: " + listQuery);
        fetch(listQuery)
        .then(res => res.json())
        .then(data => {
            this.setState({ mangas: data });
            if (data.result != 'ok') {
                console.log("Errors:");
                console.log(data.errors);
                alert(data.errors);
            }
            console.log(this.state.mangas);
        })
    }

    /**
     * Parses the 'MangaList' element's query parameters
     * as a format that the '/api/mangas' API accepts
     * @returns a String representation of this.state.queryParams 
     */
    paramsToQuery() {
        const URI =  '/api/mangas?';
        var queryParams = "";
        Object.entries(this.state.queryParams).map(entry => {
            const [key, item] = entry;
            console.log("--"+entry+"--");
            if (item == null) {
                // ignore unset parameters....
            } else if (item.constructor == Array) {
                queryParams += this.parseArrayParam(item, key);
            } else if (item.constructor == Object) {
                queryParams += this.parseObjectParam(item, key)
            } else {
                // Parse normally
                queryParams += `&${key}=${item}`
            }
        })
        const queryURI = queryParams.slice(1);
        return (URI + queryURI);
    }

    /**
     * Generic function to parse an arry of parameters as a string
     * @param {String} item: parameter item
     * @param {*} key : parameter key
     * @returns a String representation of the parameter array 
     */
    parseArrayParam(item, key) {
        let queryParams = ''
        for (var i = 0; i < item.length; i++) {
            queryParams += `&${key}[${i}]=${item[i]}`
        }
        return queryParams;
    }
    
    /**
     * Generic function to parse a object with parameters as a string
     * @param {String} items: parameter items
     * @param {*} key : parameter key
     * @returns a String representation of the parameter object 
     */
    parseObjectParam(items, key) {
        let queryParams = '';
        Object.entries(items).map( entry => {
            const [itemKey, item] = entry;
            queryParams += `&${key}[${itemKey}]=${item}`
        })
        return queryParams;
    }

    /**
     * increases this.state.offset by this.state.limit 
     * If the resulting Integer is higher than this.state.total, alert the client instead
     */
    _nextPage() {
        let newParams = this.state.queryParams;
        newParams.offset = (newParams.offset + newParams.limit);
        console.log("New offset: " + newParams.offset);
        this.updateQueryParams(newParams)

    }

    /**
     * decreases this.state.offset by this.state.limit.
     * If the resulting Integer is negative, alert the client instead
     */
    _prevPage() {
        let newParams = this.state.queryParams;
        newParams.offset = (newParams.offset -= newParams.limit);
        if (newParams.offset < 0) {
            alert("Already viewing the first page");
            return;
        }
        this.updateQueryParams(newParams)
    }

    /**
     * Changes the queryParams of the element's state
     * @param {Object} newParams the new queryParams - object
     */
    updateQueryParams(newParams) {
        this.setState({
            queryParams: newParams
        }, this.fetchMangaList())
    }

    render() {
        return (
            <div className="MangaList-root">
                <div className='MangaElements-root'>
                    {this.state.mangas.data.map(e => { return (
                        <div className='MangaEl' key={e.mangaId}>
                            <MangaElement 
                                mangaId={e.mangaId}
                                title={e.title}
                                description={e.description}
                                coverId={e.coverURL}
                                coverName={e.coverName}
                                coverURL={e.coverURL}
                            /> 
                        </div>)})
                    }
                </div>
                <div className='MangaList-navBar'>
                    <button onClick={this._prevPage} className='back'>
                    <FontAwesomeIcon icon={'arrow-left'} scale={'4x'}></FontAwesomeIcon>
                    </button>
                    <div className='MangaList-pages'>
                        <p>
                        {Math.ceil(this.state.mangas.offset / this.state.mangas.limit)+1} / {Math.ceil(this.state.mangas.total / this.state.mangas.limit)+1}
                        </p>
                    </div>
                    <button onClick={this._nextPage} className='forward'>
                    <FontAwesomeIcon icon={'arrow-right'} scale={'4x'}></FontAwesomeIcon>
                    </button>
                </div>
            </div>

        );
    }

    /**
     * Populate the list once the component has mounted
     */
    componentDidMount() {
        console.log("List component mounted.");
        console.log("Fetching initial state of list...");
        this.setQueryParams();
    }
} 

export default MangaList