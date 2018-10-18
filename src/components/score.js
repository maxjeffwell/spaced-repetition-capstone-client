import React from 'react';
import { connect } from 'react-redux';

const getcurrPercentage = (currCorrect, currAttempted) => {
  return (Math.round((currCorrect/currAttempted) * 100));
}

export class Score extends React.Component {
  render() {
    if (this.props.currPercentage > 1) {
      return (
        <div>
          <p>{this.props.currPercentage}{`%  You've answered ${this.props.currSessionCorrect} out of ${this.props.currSessionAttempted} questions correctly!`}</p>
        </div>
      );
    } else {
      return (
        <div>
          <p>{`You've answered ${this.props.currSessionCorrect} out of ${this.props.currSessionAttempted} questions correctly`}</p>
        </div>
      );
    }
  }
}

const mapStateToProps = state => {
  return {
      currSessionCorrect: state.score.currSessionCorrect,
      currSessionAttempted: state.score.currSessionAttempted,
      currPercentage: getcurrPercentage(state.score.currSessionCorrect, state.score.currSessionAttempted)
  };
};

export default connect(mapStateToProps)(Score);
