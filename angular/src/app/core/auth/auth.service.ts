import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthUtils } from 'app/core/auth/auth.utils';
import { UserService } from 'app/core/user/user.service';
import { catchError, Observable, of, switchMap, throwError } from 'rxjs';

@Injectable({providedIn: 'root'})
export class AuthService
{
    private _authenticated: boolean = false;

    /**
     * Constructor
     */
    constructor(
        private _httpClient: HttpClient,
        private _userService: UserService,
    )
    {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Setter & getter for access token
     */
    set accessToken(token: string)
    {
        localStorage.setItem('accessToken', token);
    }

    get accessToken(): string
    {
        return localStorage.getItem('accessToken') ?? '';
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Forgot password
     *
     * @param email
     */
    forgotPassword(email: string): Observable<any>
    {
        return this._httpClient.post('api/auth/forgot-password', email);
    }

    /**
     * Reset password
     *
     * @param password
     */
    resetPassword(password: string): Observable<any>
    {
        return this._httpClient.post('api/auth/reset-password', password);
    }

    /**
     * Sign in
     *
     * @param credentials
     */
    signIn(credentials: { email: string; password: string }): Observable<any>
    {
        // Throw error, if the user is already logged in
        if ( this._authenticated )
        {
            return throwError('User is already logged in.');
        }

        return this._httpClient.post('http://localhost:3000/api/signIn', credentials).pipe(
            switchMap((response: any) =>
            {
                // Store the access token in the local storage
                this.accessToken = response.accessToken;

                // Set the authenticated flag to true
                this._authenticated = true;

                // Store the user on the user service
                this._userService.user = response.user;
                sessionStorage.setItem('myData', JSON.stringify(response.user));

                // Return a new observable with the response
                return of(response);
            }),
        );
    }

    /**
     * Sign in using the access token
     */
    signInUsingToken(): Observable<boolean> {
       /* const sampleUser = {
          id: '1',
          name: 'John Doe',
          email: 'john@example.com',
        };*/
        const savedData = JSON.parse(sessionStorage.getItem('myData'));

        // Simulate a successful sign-in by setting the user data and returning true
        this._userService.user = savedData;
        this._authenticated = true;
    console.log("tokken",this.accessToken)
        return of(true);
      }

/*
signInUsingToken(): Observable<any>
{
    // Sign in using the token
    return this._httpClient.post('http://localhost:3000/api/sign-in-with-token', {
        accessToken: this.accessToken,
    }).pipe(
        catchError(() =>

            // Return false
            of(false),
        ),
        switchMap((response: any) =>
        {
            // Replace the access token with the new one if it's available on
            // the response object.
            //
            // This is an added optional step for better security. Once you sign
            // in using the token, you should generate a new one on the server
            // side and attach it to the response object. Then the following
            // piece of code can replace the token with the refreshed one.
            if ( response.accessToken )
            {
                this.accessToken = response.accessToken;
            }

            // Set the authenticated flag to true
            this._authenticated = true;

            // Store the user on the user service
            this._userService.user = response.user;

            // Return true
            return of(true);
        }),
    );
}
*/
    /**
     * Sign out
     */
    signOut(): Observable<any>
    {
        // Remove the access token from the local storage
        localStorage.removeItem('accessToken');

        // Set the authenticated flag to false
        this._authenticated = false;
        sessionStorage.removeItem('myData');
        // Return the observable
        return of(true);
    }

    /**
     * Sign up
     *
     * @param user
     */
    signUp(user: { name: string; email: string; password: string; company: string }): Observable<any>
    {
        return this._httpClient.post('api/auth/sign-up', user);
    }

    /**
     * Unlock session
     *
     * @param credentials
     */
    unlockSession(credentials: { email: string; password: string }): Observable<any>
    {
        return this._httpClient.post('api/auth/unlock-session', credentials);
    }

    /**
     * Check the authentication status
     */
    check(): Observable<boolean>
    {
        // Check if the user is logged in
        if ( this._authenticated )
        {
            console.log("Check if the user is logged in",this._authenticated )
            return of(true);
        }

        // Check the access token availability
        if ( !this.accessToken )
        {            console.log("Check the access token availability",!this.accessToken)

            return of(false);
        }

        // Check the access token expire date
        if ( AuthUtils.isTokenExpired(this.accessToken) )
        {            console.log("Check the access token expire date",AuthUtils.isTokenExpired(this.accessToken))

            return of(false);
        }
        console.log("check")
     
console.log("signintokkenretour",this.signInUsingToken())
        // If the access token exists, and it didn't expire, sign in using it
        return this.signInUsingToken();
    }
}
