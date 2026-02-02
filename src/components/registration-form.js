import React from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { registerUser } from '../actions/users';
import { login } from '../actions/auth';
import styles from './landing-page.module.css';

export default function RegistrationForm() {
    const dispatch = useDispatch();
    const {
        register,
        handleSubmit,
        watch,
        formState: { errors, isSubmitting },
        setFocus,
        setError
    } = useForm();

    const password = watch('password');

    const onSubmit = async (values) => {
        const { username, password, firstName, lastName } = values;
        const user = { username, password, firstName, lastName };

        try {
            await dispatch(registerUser(user));
            await dispatch(login(username, password));
        } catch (err) {
            setError('root', { message: err.message || 'Registration failed' });
            setFocus('firstName');
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

            <label htmlFor="firstName">First name</label>
            <input
                type="text"
                id="firstName"
                {...register('firstName')}
            />
            {errors.firstName && (
                <div className="form-error">{errors.firstName.message}</div>
            )}

            <label htmlFor="lastName">Last name</label>
            <input
                type="text"
                id="lastName"
                {...register('lastName')}
            />
            {errors.lastName && (
                <div className="form-error">{errors.lastName.message}</div>
            )}

            <label htmlFor="username">Username</label>
            <input
                type="text"
                id="username"
                {...register('username', {
                    required: 'Required',
                    validate: {
                        nonEmpty: value => value.trim() !== '' || 'Cannot be empty',
                        isTrimmed: value => value.trim() === value || 'Cannot start or end with whitespace'
                    }
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
                    minLength: { value: 10, message: 'Must be at least 10 characters long' },
                    maxLength: { value: 72, message: 'Must be at most 72 characters long' },
                    validate: {
                        isTrimmed: value => value.trim() === value || 'Cannot start or end with whitespace'
                    }
                })}
            />
            {errors.password && (
                <div className="form-error">{errors.password.message}</div>
            )}

            <label htmlFor="passwordConfirm">Confirm password</label>
            <input
                type="password"
                id="passwordConfirm"
                {...register('passwordConfirm', {
                    required: 'Required',
                    validate: {
                        nonEmpty: value => value.trim() !== '' || 'Cannot be empty',
                        matchesPassword: value => value.trim() === password?.trim() || 'Does not match'
                    }
                })}
            />
            {errors.passwordConfirm && (
                <div className="form-error">{errors.passwordConfirm.message}</div>
            )}

            <button type="submit" disabled={isSubmitting}>
                Register
            </button>
        </form>
    );
}
