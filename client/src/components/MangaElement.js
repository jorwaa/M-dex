
import React from "react";
import LazyLoad from 'react-lazyload';

import './style/MangaElement.css';

class MangaElement extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            displayedDescription: (this.props.manga.attributes.description ? (this.props.manga.attributes.description.en).slice(0,150)+"..." : "..."),
            displayedTitle: ((this.props.manga.attributes.title.en).slice(0,30)+"...")
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
        return (
            <a className="mangaLink" href={`/manga/${this.props.manga.id}`}>
                <div className="mangaDiv">
                <LazyLoad className="mangaImgWrapper"
                    height={'100%'}>
                            <img className="mangaImg" src={`${coverURL}.256.jpg`} alt={this.props.manga.attributes.title.en} />
                    </LazyLoad>
                    <div className="mangaDetails">
                            <h3 className="mangaTitle"> {this.props.manga.attributes.title.en} </h3>
                        <p className="mangaDescription"> {this.state.displayedDescription} </p>
                    </div>
                </div>
            </a>
        )
    }
}

export default MangaElement;