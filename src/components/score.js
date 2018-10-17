import React from 'react';
import { connect } from 'react-redux';

export class Score extends React.component {

    render() {
        const currentPercentage = this.props.thisTimeAtt > 0 ? this.props.currentCorrect / this.props.thisTimeAtt : 0;
        const allTimePercentage = this.props.allTimeAtt > 0 ? this.props.allTimeCorrect : 0;


        return (
            <div id="score">
                <div id="score-text-parent">
                    <div className="score-text">
                        <span className="score-label">Current Game Stats</span>
                        <span className="score-pct">{currentPercentage.toLocaleString(undefined, {style: 'percent', minimumFractionDigits: 1})}</span>
                        {this.props.thisTimeCorrect} of {this.props.thisTimeAtt}
                    </div>
                    <div className="score-text">
                        <span className="score-label">All Time Stats</span>
                        <span className="score-pct">{allTimePercentage.toLocaleString(undefined, {style: 'percent', minimumFractionDigits: 1})}</span>
                        {this.props.allTimeCorrect} of {this.props.allTimeAtt}
                    </div>
                </div>
            </div>

        )
    }
}


export const mapStateToProps = state => ({
    thisTimeAtt: state.learning.thisTimeAtt,
    currentCorrect: state.learning.currentCorrect,
    allTimeCorrect: state.learning.allTimeCorrect,
    allTimeAtt: state.learning.allTimeAtt
});

export default connect(mapStateToProps(Score));
