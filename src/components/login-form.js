import React from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { login } from '../actions/auth';
import styles from './landing-page.module.css';

export default function LoginForm() {
    const dispatch = useDispatch();
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        setFocus,
        setError
    } = useForm();

    const onSubmit = async (values) => {
        try {
            await dispatch(login(values.username, values.password));
        } catch (err) {
            setError('root', { message: err.message || 'Login failed' });
            setFocus('username');
        }
    };

    return (
        <form
            className={styles.loginForm}
            onSubmit={handleSubmit(onSubmit)}
        >
            {errors.root && (
                <div className={styles.formError} aria-live="polite">
                    {errors.root.message}
                </div>
            )}
            <label htmlFor="username">Username</label>
            <input
                type="text"
                id="username"
                {...register('username', {
                    required: 'Required',
                    validate: value => value.trim() !== '' || 'Cannot be empty'
                })}
            />
            {errors.username && (
                <div className="form-error">{errors.username.message}</div>
            )}

            <label htmlFor="password">Password</label>
            <input
                type="password"
                id="password"
                {...register('password', {
                    required: 'Required',
                    validate: value => value.trim() !== '' || 'Cannot be empty'
                })}
            />
            {errors.password && (
                <div className="form-error">{errors.password.message}</div>
            )}

            <button type="submit" disabled={isSubmitting}>
                Log in
            </button>
        </form>
    );
}
