
import React from "react";
import LazyLoad from 'react-lazyload';

import './style/ChapterElement.css';

/**
 * Props:
 * mangaLoaded: Boolean,
 * chapters: [
 *      {
 *           mangaId: String,
 *           chapterId: String,
 *           volume: String,
 *           chapter: String,
 *           title: String,
 *      }
 *  ],
 * manga: {
 *      //manga & cover data
 *  }
 * ]
 */
class ChapterElement extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            chapters: this.props.chapters,
            manga: this.props.manga,
            chapterTitles: [],
            //chapterTitle: (this.props.title ? (this.props.title).slice(0,30)+"..." : "...")
        }
    }

    getRelationships(obj, type) {
        var relationships = []
        for (let i = 0; i < obj.relationships.length; i++) {
            if (obj.relationships[i].type == type)
                relationships.push(obj.relationships[i]);
        }
        return (relationships.length > 0 ? relationships : [null]);
    }

    render() {
        var coverURL = ""
        var coverRelationship = this.getRelationships(this.props.manga, 'cover_art')[0];
        if (coverRelationship != null) {    
            coverURL = `https://uploads.mangadex.org/covers/${this.props.manga.id}/${coverRelationship.attributes.fileName}`
        }
        /*var coverRelationship = "";
        var coverURL = ""
        if (this.props.mangaLoaded) {
            coverRelationship = this.props.manga.relationships[(this.props.manga.relationships.length)-1];
            console.log(coverRelationship);
            coverURL = `https://uploads.mangadex.org/covers/${this.props.manga.id}/${coverRelationship.attributes.fileName}`
        }*/
        return (
        <div className="mangaDiv">
            <a className="mangaImgLink" href={`/manga/${this.props.manga.id}`}>
            <LazyLoad className="mangaImgWrapper"
                height={'100%'}>
                    {(this.props.mangaLoaded ? 
                    <img className="mangaImg" src={`${coverURL}.256.jpg`} alt={this.props.manga.attributes.title.en} /> : "")}
            </LazyLoad>
            </a>
            <div className="mangaDetails">
                <a href={`/manga/${this.props.manga.id}`}>
                <p className="mangaTitle"> {this.props.mangaLoaded ? this.props.manga.attributes.title.en : "Title missing"} </p>
                </a>
                <div className="chapters">
                {this.state.chapterTitles.map((e, i) => { return (
                    <p key={i}>{e}</p> )
                })}
                </div>
            </div>
        </div>
        )
    }

    componentDidMount() {
        var chapterTitles = [];
        for (let i = 0; i < this.props.chapters.length; i++) {
            //console.log(i);
            //console.log(this.props.data);
            let chapterTitle = "";
            if (this.props.chapters[i].volume)
                chapterTitle += `Vol. ${this.state.chapters[i].volume} `;
            if (this.props.chapters[i].chapter)
                chapterTitle += `Ch ${this.state.chapters[i].chapter} `;
            if (this.props.chapters[i].title)
                chapterTitle += `- ${this.state.chapters[i].title}`
            chapterTitles.push(chapterTitle);
        }
            this.setState({
                chapterTitles: chapterTitles,
            })
    }

}

export default ChapterElement;