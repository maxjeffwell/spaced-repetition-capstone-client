import React from 'react';
import { connect } from 'react-redux';

export class Feedback extends React.Component {
    render() {
        // let feedback = '';
        //     if (this.props.status === "incorrect") {
        //     feedback = (
        //         <div>

        return (
        <div className="answer-label">
           <p>
               {`The correct answer is: ${this.props.protectedData[0].answer}`}
           </p>
        </div>

            //         </div>
            //     )
            // }
            // else {
            //     feedback = <div></div>
        );
    }
}

const mapStateToProps = state => {
    // const {currentUser} = state.auth;
    return {
        // username: state.auth.currentUser.username,
        // firstName: `${currentUser.firstName}`,
        protectedData: state.protectedData.data
    };
};

        // export const mapStateToProps = state => ({
        //     answer: state.learning.currentAnswer,
        //     status: state.learning.currentStatus,
        //     thisTimeAtt: state.learning.thisTimeAtt,
        //     thisTimeCorrect: state.learning.thisTimeCorrect
        // });

export default connect(mapStateToProps)(Feedback);
