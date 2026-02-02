import React from 'react';
import { useForm } from 'react-hook-form';
import { useSelector, useDispatch } from 'react-redux';
import { correctAnswer, incorrectAnswer } from "../actions/answer-submit";
import { incrementAttCount, incrementCorrectCount } from "../actions/scores";

export default function AnswerInput() {
    const dispatch = useDispatch();
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting }
    } = useForm();

    const currentUser = useSelector(state => state.auth.currentUser);

    // Get answer from current question
    const answer = currentUser?.questions?.[currentUser?.head]?.answer || '';

    const onSubmit = (values) => {
        const { answerInput } = values;
        reset();

        if (answer === answerInput) {
            dispatch(correctAnswer);
            dispatch(incrementAttCount);
            dispatch(incrementCorrectCount);
        } else {
            dispatch(incorrectAnswer);
            dispatch(incrementAttCount);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <label htmlFor="answerInput">Answer: </label>
            <input
                type="text"
                id="answerInput"
                {...register('answerInput', {
                    required: 'Required',
                    validate: value => value.trim() !== '' || 'Cannot be empty'
                })}
            />
            {errors.answerInput && (
                <div className="form-error">{errors.answerInput.message}</div>
            )}
            <button type="submit" disabled={isSubmitting}>
                Submit
            </button>
        </form>
    );
}
