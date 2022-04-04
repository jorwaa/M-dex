var rawData = require("./TestMangaInfo").mangaData
const login = require('./../handlers/auth').login
const checkToken = require( './../handlers/auth').checkToken
const refreshSession = require('./../handlers/auth').refreshSession

const axios = require('axios')
const path = require("path");
const express = require('express');
const { json } = require("express")
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
 *  'errors': String[]
 * }
 * ]
 */
//TODO: skrive om det meste
router.get('/mangas', (req, res) => { 
    const offset = req.query.offset;
    const limit = req.query.limit;
    const localBaseUrl = '/api/mangas';
    const fullUrl = req.originalUrl;
    //console.log(`base: ${localBaseUrl} full: ${fullUrl}`);
    const queryParams = (fullUrl.substring(localBaseUrl.length))
    //console.log("queryParams: "+ queryParams);
    //console.log(`Fetching ${limit} elements with and offset of ${offset}.`);
    //console.log("Url:");
    const baseURL = 'https://api.mangadex.org/manga'
    //console.log(`${baseURL}${queryParams}`);
    axios.get(`${baseURL}${queryParams}`)
    .then(response => { 
        res.json(response.data);
        //generateMangaResponse(response.data, res)
    })
    .catch(err => {
        res.json({
            'status': 'error',
            'errors': err.message,
        })
    });
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
    .then(response => { 
//      generateUserFeedResponse(response.data, res)
        res.json(response.data);
    })
    .catch(err =>  {
        console.log("Error!");
        console.log(err);
        res.status(400).json({
            'status': 'error',
            'errors': err.message
        })
    } );
})

function generateUserFeedResponse(chapterData, res) {
    const metadata = {
        'offset': chapterData.offset,
        'limit': chapterData.limit,
        'total': chapterData.total,
    };

    var mangaQueryParams = "";
    var chapterObjs = [];
    let chapters = chapterData.data
    for (let i = 0; i < chapters.length; i++) {
        let chapter = chapters[i];
        let tmpObj = {
            'chapterId': chapter.id,
            'title': chapter.attributes.title,
            'volume': chapter.attributes.volume,
            'chapter': chapter.attributes.chapter,
            'published': chapter.attributes.publishAt,
            'mangaId': getRelationships(chapter, 'manga')[0],
        };

        chapterObjs.push(tmpObj);
        mangaQueryParams += `&ids[]=${tmpObj.mangaId}`
    }

    //
    // Hum, no cover_art relationship in chapter objects...
    //fetchCovers(chapterObjs, respondToMangasReq, res, chapterObjs, metadata)
    //Oh well, call the '/manga' API either way ;)

    const mangaBaseURL = 'https://api.mangadex.org/manga?'
    var mangas = {};
    axios.get(`${mangaBaseURL}${mangaQueryParams.substring(1)}`)
    .then(response => {
        let mangas = response.data.data
        for (let i = 0; i < mangas.length; i++) {
            let tmpManga = {
                'mangaId': mangas[i].id,
                'coverId': getRelationships(mangas[i], "cover_art")[0],
                'title': (mangas[i].attributes.title.en ?
                    mangas[i].attributes.title.en :
                    Object.values(mangas[i].attributes.altTitles[0])[0]),
                'description': mangas[i].attributes.description.en,
            }

            for (let j = 0; j < chapterObjs.length; j++) {
                if (chapterObjs[j].mangaId == tmpManga.mangaId) {
                    chapterObjs[j] = {
                        ...chapterObjs[j],
                        'coverId': tmpManga.coverId,
                        'mangaData': tmpManga,
                    };
                }
            }
        }
        fetchCovers(chapterObjs, respondToMangasReq, res, chapterObjs, metadata);
    })
}


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
        //console.log(coversData.errors);
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
function generateMangaResponse(mangaData, res) {
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
    //console.log("Manga Elemets fetched: " + mangaData.data.length);
    var rawData = mangaData
    var sortedArr = [];
    var sortedData = {
        titles: [],
        covers: [],
        descriptions: [],
    };
    var queryIDs = {
        covers: [],
    }
    mangaData.data.forEach(el => {
        //Skrive om:
        sortedArr.push({
            'mangaId': el.id,
            'coverId': getRelationships(el, "cover_art")[0],
            'title': (el.attributes.title.en ? 
                    el.attributes.title.en :
                     Object.values(el.attributes.altTitles[0])[0]),
            'description': el.attributes.description.en,
        })
        /*
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
        */
    });
    let metadata = {
        'limit': mangaData.limit,
        'offset': mangaData.offset,
        'total': mangaData.total,
    }
    fetchCovers(sortedArr, respondToMangasReq, res, sortedArr, metadata);
    /*.then((coversObjects) => {
        console.log(coversObjects);
        respondToMangasReq(coversObjects, res)
    })*/
}
function respondToMangasReq(covers, res, sortedArr, metadata) {
    //console.log("Inne i respondToMangas");
    let cleanedCovers = cleanCoverResponse(covers.data)
    //console.log(cleanedCovers);
    let errors = ["None!"];
    const returnObjects = combineArrObjOn(sortedArr, cleanedCovers, 'mangaId');
    res.json({
        'result': "ok",
        'data': returnObjects,
        'limit': metadata.limit,
        'offset': metadata.offset,
        'total': metadata.total,
        'errors': errors,
    })
}
    // New function:
    //Todo: maybe add support for multiple trailing arguments?
function fetchCovers(objectsArr, callback, res, arg1, arg2="") {
    // Check if objects in paramater array is legal:
    if (objectsArr[0].coverId == null) {
        console.log("Illegal argument 'objectsArr': Either empty or does not contain fiel 'coverId'");
        res.json({
            'status': 'error',
            'errors': 'Internal error occured when fetching manga covers'
        })
        return;
    }

    let ids = "";
    for (let i = 0; i < objectsArr.length; i++) {
        ids += `ids[${i}]=${objectsArr[i].coverId}&`;
    }

    let baseURL = 'https://api.mangadex.org/';
    let coverURI = `cover?${ids}limit=${objectsArr.length}`;
    axios.get(`${baseURL}${coverURI}`)
    .then(response => {
        callback(response.data, res, arg1, arg2);
    })
    .catch(err => {
        res.json({
            'status': 'error',
            'errors': err.message
        })
    })
}

function combineArrObjOn(arr, obj, objKey) {
    for (let i = 0; i < arr.length; i++) {
        arr[i] = {
            ...arr[i],
            ...obj[arr[i].mangaId],
            'coverURL': `https://uploads.mangadex.org/covers/${arr[i].mangaId}/${obj[arr[i].mangaId].fileName}`
        }
    }
    return arr;
}

/** Returns an object containing only the wanted data related to the cover API response
* @param coversData: response data of a /cover API query 
* @returns an object with only necessary data extracted from the response
*/
function cleanCoverResponse(coversData) {

    
    var coversClean = {};
    let covers = coversData;
    for (let i = 0; i < covers.length; i++) {
        let cover = covers[i];
        let coverObj = {};

        coverObj['coverId'] = cover.id;
        coverObj.fileName = cover.attributes.fileName;

        let mangaIdFound = false
        for (let j = 0; j < cover.relationships.length && !mangaIdFound; j++) {
            if (cover.relationships[j].type == 'manga') {
                coverObj.mangaId = cover.relationships[j].id;
                mangaIdFound = true;
                break;
            }
        }

        coversClean[coverObj.mangaId] = coverObj;
    }

    return coversClean;

}

function getRelationships(obj, type) {
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