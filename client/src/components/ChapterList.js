import './style/ChapterList.css';

import React from "react";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faArrowLeft, faArrowRight } from '@fortawesome/free-solid-svg-icons';

import ChapterElement from "./ChapterElement";

/**
 * A generic List element that given the response of a
 * '/api/mangas' API call, displays the response data as 
 * a list of 'MangaElement'-objects
 */
class ChapterList extends React.Component {
    constructor(props) {
        super(props);
        library.add(faArrowLeft);
        library.add(faArrowRight);

        this.state = {
            isAuthenticated: false,
            limit: 0,
            offset: 0,
            total: 0,
            chapters: {
                result: "ok",
                errors: [],
                data: [],
            },
            mangas: {
                result: "ok",
                limit: 0,
                offset: 0,
                total: 0,
                errors: [],
                data: [],
            },
            listElements: [],
            mangaLoaded: false,
            queryParams: this.props.queryParams,
        }

        this.setQueryParams = this.setQueryParams.bind(this);
        this.updateQueryParams = this.updateQueryParams.bind(this);

        this.fetchChapterList = this.fetchChapterList.bind(this);
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
        }, this.fetchChapterList())
    }

    /**
     * Does an asynchronous GET call to the '/api/mangas' API,
     * and when a response is given, parses the response body
     * to the 'MangaList' element's state
     */
    fetchChapterList() {
        console.log("Fetching latest mangas...");
        let listQuery = this.paramsToQuery()
        //fetch(`/api/mangas?offset=${this.state.offset}&limit=${this.state.limit}`)
        console.log("URL: " + listQuery);
        var config = {};
        if (this.props.isAuthenticated) {
            var bearer
            const sessionCookie = document.cookie
            .split('; ')
            .find(el => el.startsWith('sessionId='))
            if (sessionCookie == null) {
                console.log("session token cookie not found");
                location.reload(false);
                return;
            }else {
                console.log("session token cookie found");
                bearer = sessionCookie.split('=')[1];
            }

            config = {
                headers: {Authorization: `Bearer ${bearer}`}
            }
        }

        fetch(listQuery, config)
        .then(res => res.json())
        .then(data => {
            //this.setState({ chapters: data }, () => {
                if (data.result != 'ok') {
                    console.log("Errors:");
                    console.log(data.errors);
                    alert(data.errors);
                }
                // Update limit and offset used in page display
                this.setState({
                    limit: data.limit,
                    offset: data.offset,
                    total: data.total,
                })
                console.log(this.state.limit);
                //Create ChapterElements:
                var listElements = [];
                let chapters = data.data
                for (let i = 0, j = 0; i < chapters.length; i++) {
                    let mangaId = this.getRelationships(chapters[i], 'manga')[0];
                    let listElementChapter = {
                        mangaId: mangaId,
                        chapterId: chapters[i].chapterId,
                        volume: chapters[i].attributes.volume,
                        chapter: chapters[i].attributes.chapter, 
                        title: chapters[i].attributes.title,
                    }
                    if (j == 0 || (listElements[j-1].mangaId != mangaId)) {
                        let listElement = {
                            mangaId: mangaId,
                            chapters: [listElementChapter],
                        }
                        listElements.push(listElement);
                        j++;
                    }else {
                        listElements[j-1].chapters = listElements[j-1].chapters.concat(listElementChapter);// = ((listElements[j-1].chapters).push(listElementChapter))
                    }
                }
                this.fetchRelatedMangas(listElements);
        });
    }

    fetchRelatedMangas(listElements) {
        //get manga IDs:
        var mangaIds = []
        for (let i = 0; i < listElements.length; i++) {
            let mangaId =  listElements[i].mangaId;
            mangaIds.push(mangaId);
        }

        var args = '?includes[]=cover_art';
        for (let i = 0; i < mangaIds.length; i++) {
            args += `&ids[]=${mangaIds[i]}`;
        }
        fetch(`/api/mangas${args}`)
        .then(response => response.json())
        .then(data => {
            let mangas = data.data;
            for (let i = 0; i < listElements.length; i++) {
                //let ind = listElements.findIndex(el => el[mangaId] == mangas[i].mangaId);
                for (let j = 0; j < mangas.length; j++) {
                    if (listElements[i].mangaId == mangas[j].id) {
                        listElements[i] = {
                            ...listElements[i],
                            manga: {
                                ...mangas[j]
                            },
                        }
                        break;
                    }
                }
            }
            const newListElements = listElements;
            this.setState({
                listElements: newListElements,
                mangaLoaded: true,
            });
        })
    }

    getRelationships(obj, type) {
        var relationshipIds = [];
        let i = 0;
        for (i; i < obj.relationships.length; i++) {
            if (obj.relationships[i].type == type) {
                relationshipIds.push(obj.relationships[i].id);
            }
        }
        return relationshipIds;
    }

    /**
     * Parses the 'MangaList' element's query parameters
     * as a format that the '/api/mangas' API accepts
     * @returns a String representation of this.state.queryParams 
     */
    paramsToQuery() {
        //const URI =  '/api/mangas?';
        const URI = this.props.endpoint;
        var queryParams = "";
        Object.entries(this.state.queryParams).map(entry => {
            const [key, item] = entry;
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
        }, this.fetchChapterList())
    }

    render() {
        if (this.state.chapters.data == null) {
            return (
            <div className='MangaList-root'>
                <div className='MangaElements-root'>
                   <h2>List is empty!</h2>
                </div>
            </div>
            )
        }
        return (
            <div className="MangaList-root">
            <div className='MangaList-header'>
                <h5>Recent updates</h5>
            </div>
                <div className='MangaElements-root'>
                    {this.state.listElements.map((e, i) => { return (
                        <div className='MangaEl' key={`${e.mangaId}-${i}`}>
                            <ChapterElement 
                                chapters={e.chapters}
                                manga={e.manga}
                                mangaLoaded={this.state.mangaLoaded}
                            /> 
                        </div>)})
                    }
                </div>
                <div className='MangaList-navBar'>
                    <button onClick={this._prevPage} className='back'>
                    <FontAwesomeIcon icon={'arrow-left'} size={'3x'}></FontAwesomeIcon>
                    </button>
                    <div className='MangaList-pages'>
                        <p>
                        {Math.ceil(this.state.offset / this.state.limit)+1} / {Math.ceil(this.state.total / this.state.limit)+1}
                        </p>
                    </div>
                    <button onClick={this._nextPage} className='forward'>
                    <FontAwesomeIcon icon={'arrow-right'} size={'3x'}></FontAwesomeIcon>
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

export default ChapterList