
import React from "react";
import LazyLoad from 'react-lazyload';

import './style/MangaElement.css';

class MangaElement extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            displayedDescription: (this.props.description ? (this.props.description).slice(0,150)+"..." : "..."),
            displayedTitle: ((this.props.title).slice(0,30)+"...")
        }
    }

    render() {
        return (
            <div className="mangaDiv">
            <a className="mangaImgLink" href={`/manga/${this.props.mangaId}`}>
            <LazyLoad className="mangaImgWrapper"
                height={'100%'}>
                        <img className="mangaImg" src={`${this.props.coverURL}.256.jpg`} alt={this.props.title} />
                </LazyLoad>
                </a>
                <div className="mangaDetails">
                    <a href={`/manga/${this.props.mangaId}`}>
                        <h3 className="mangaTitle"> {this.props.title} </h3>
                    </a>
                    <p className="mangaDescription"> {this.state.displayedDescription} </p>
                </div>
            </div>
        )
    }
}

export default MangaElement;