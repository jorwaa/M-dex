var rawData = require("./TestMangaInfo").mangaData
const login = require('./../handlers/auth').login
const checkToken = require( './../handlers/auth').checkToken
const refreshSession = require('./../handlers/auth').refreshSession

const axios = require('axios')
const path = require("path");
const express = require('express');
const router = express.Router();


router.post('/login', express.json(), login);

router.post('/refresh', express.json(), refreshSession)

router.get('/auth/:token', checkToken);

/**
 * the '/manga' API retrieves a list of manga elements 
 * And some related data. Works well in conjunction
 * with the client-side 'MangaList'-element.
 * @returns A list of Json elements:
 * [
 * {
 *  'result': response.data.result,
 *  'data': {
 *      'mangaId': String,
 *      'title': String,
 *      'description': String,
 *      'coverId': String,
 *      'coverName': String,
 *      'coverURL': String,
 *  },
 *  'limit': Integer,
 *  'offset': Integer,
 *  'total': Integer,
 *  'errors': String[],
 * }
 * ]
 */
router.get('/mangas', (req, res) => {
    const offset = req.query.offset;
    const limit = req.query.limit;
    const localBaseUrl = '/api/mangas';
    const fullUrl = req.originalUrl;
    console.log(`base: ${localBaseUrl} full: ${fullUrl}`);
    const queryParams = (fullUrl.substring(localBaseUrl.length))
    console.log("queryParams: "+ queryParams);
    console.log(`Fetching ${limit} elements with and offset of ${offset}.`);
    console.log("Url:");
    const baseURL = 'https://api.mangadex.org/manga'
    let mangaURI = `manga?limit=${limit}&offset=${offset}&availableTranslatedLanguage[]=en&order[latestUploadedChapter]=desc`
    console.log(`${baseURL}${queryParams}`);
    axios.get(`${baseURL}${queryParams}`)
    .then(response => { generateRequest(response.data, res)});
})

router.get('/userlist', (req, res) => {
    console.log("IN /USERLIST ENDPOiNT");
    const offset = req.query.offset;
    const limit = req.query.limit;
    const localBaseUrl = '/api/userlist';
    const fullUrl = req.originalUrl;
    console.log(`base: ${localBaseUrl} full: ${fullUrl}`);
    const queryParams = (fullUrl.substring(localBaseUrl.length))
    console.log("queryParams: "+ queryParams);
    console.log(`Fetching ${limit} elements with and offset of ${offset}.`);
    console.log("Url:");
    const baseURL = 'https://api.mangadex.org/user/follows/manga/feed'
    let mangaURI = `manga?limit=${limit}&offset=${offset}&availableTranslatedLanguage[]=en&order[latestUploadedChapter]=desc`
    console.log(`${baseURL}${queryParams}`);
    //console.log(JSON.stringify(req.headers));
    const config = {
        headers: {
            'Authorization': req.headers.authorization
        }
    }

    axios.get(`${baseURL}${queryParams}`, config)
    .then(response => { generateRequest(response.data, res)})
    .catch(err =>  {
        console.log("Error!");
        console.log(err);
        res.status(400).json(err)
    } );
})

/**
 * Takes the response of a api.mangadex.org/covers-request & 
 * sorts it in relation to an array with related manga IDs
 * @param {*} coversData: response object of a /covers API request
 * @param {*} dataArr: An object of related mangas data where
 *              an array 'dataArr.titles.mangaID is present  
 * @returns a JSON array ~ coversData.join(dataArr).on(mangaId)
 */
function sortByMangaId(coversData, dataArr) {
    if (coversData.result != 'ok') {
        log("Error in cover API request!");
        console.log(coversData.errors);
    }
    
    const covers = coversData.data;
    var arr = []
    for (var i = 0; i < dataArr.titles.length; i++) {
        let mangaId = dataArr.titles[i].mangaId;
        let title = dataArr.titles[i].val;
        let description = dataArr.descriptions[i].val;
        
        var coverId = "";
        var coverName = "";
        for (var coverInd = 0; coverInd < covers.length; coverInd++) {
            var cover = covers[coverInd];
            for (var relInd = 0; relInd < cover.relationships.length; relInd++) {
                var relationship = cover.relationships[relInd]; 
                if (relationship.type == "manga" && relationship.id == mangaId) {
                    coverId = cover.id;
                    coverName = cover.attributes.fileName;
                    break;
                }
            }
        }
        var coverURL = `https://uploads.mangadex.org/covers/${mangaId}/${coverName}`

        arr.push({
            'mangaId': mangaId,
            'title': title,
            'description': description,
            'coverId': coverId,
            'coverName': coverName,
            'coverURL': coverURL,
        });
    }
    return arr;
}

/**
 * Given an array of /manga objects, formats the relevant data before sending it to the client
 * @param {Json} mangaData array of objects returned from the /manga API
 * @param {Response} res Response object to which the formatted data will be sent
 */
function generateRequest(mangaData, res) {
    //If error, return the error objects
    if (mangaData.result != 'ok') {
        console.log("Error occured during GET /manga:");
        res.json({
            result: mangaData.result,
            errors: mangaData.errors,
            data: [],
        })
        return;
    }
    console.log("Manga Elemets fetched: " + mangaData.data.length);
    var rawData = mangaData
    var sortedData = {
        titles: [],
        covers: [],
        descriptions: [],
    };
    var queryIDs = {
        covers: [],
    }
    mangaData.data.forEach(el => {
        console.log(el);
        sortedData.titles.push({
            'val': (el.attributes.title.en ? el.attributes.title.en : Object.values(el.attributes.altTitles[0])[0]),
            'mangaId': el.id
        });
        console.log(el.attributes.title.en);
        sortedData.descriptions.push({
            'val': el.attributes.description.en,
            'mangaId': el.id
        });
        getCoverId(el, queryIDs);
    });
    let ids = "";
    for (let i = 0; i < queryIDs.covers.length; i++) {
        ids += `ids[${i}]=${queryIDs.covers[i]}&`;
    }
    let baseURL = 'https://api.mangadex.org/';
    let coverURI = `cover?${ids}limit=${queryIDs.covers.length}`;
    axios.get(`${baseURL}${coverURI}`)
    .then(response => {
        console.log("Cover API request done.")
        var mangaObjects = sortByMangaId(response.data, sortedData);
        let errors = ["None!"];
        if (response.data.errors)
        errors = response.data.errors;
        res.json({
            'result': response.data.result,
            'data': mangaObjects,
            'limit': mangaData.limit,
            'offset': mangaData.offset,
            'total': mangaData.total,
            'errors': errors,
        })
    })
}

/**
 * Retrieves the ID of the first instance of 'cover_art' that is found in a 'manga' object
 * @param {JSON} obj: object returned from the /manga API 
 * @param {*} arr: Array of cover_art IDs 
 */
function getCoverId(obj, arr) {
    let i = 0;
    for (i; i < obj.relationships.length; i++) {
        if (obj.relationships[i].type == 'cover_art') {
            arr.covers.push(obj.relationships[i].id);
            break;
        }
    }
    return;
}

router.get('*', (req, res) => {
    res.status(403).send('403 Forbidden');
});


module.exports = router;