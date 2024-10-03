// src/app/state/effects/account.effects.ts

import {Injectable} from "@angular/core";
import {Actions, createEffect, ofType} from "@ngrx/effects";
import * as AccountActions from "../actions/account.actions";
import {from, of} from "rxjs";
import {switchMap, map, catchError, mergeMap, tap} from "rxjs/operators";
import {FirestoreService} from "../../core/services/firestore.service";
import {Account, RelatedAccount} from "../../models/account.model";

@Injectable()
export class AccountEffects {
  constructor(
    private actions$: Actions,
    private firestoreService: FirestoreService,
  ) {}

  // Load Accounts
  loadAccounts$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AccountActions.loadAccounts),
      switchMap(() =>
        this.firestoreService.getAllAccounts().pipe(
          map((accounts) => AccountActions.loadAccountsSuccess({accounts})),
          catchError((error) => {
            console.error("Effect: Error loading account:", error);
            return of(
              AccountActions.loadAccountFailure({
                error: error.message || error,
              }),
            );
          }),
        ),
      ),
    ),
  );

  // Load Account by ID with real-time updates
  loadAccount$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AccountActions.loadAccount),
      tap(({accountId}) =>
        console.log(`Effect: Loading account with ID: ${accountId}`),
      ),
      mergeMap(({accountId}) =>
        this.firestoreService.getDocument<Account>("accounts", accountId).pipe(
          tap((account) =>
            console.log(`Effect: Fetched account data:`, account),
          ),
          map((account) => {
            if (account) {
              return AccountActions.loadAccountSuccess({account});
            } else {
              return AccountActions.loadAccountFailure({
                error: "Account not found",
              });
            }
          }),
          catchError((error) => {
            console.error("Effect: Error loading account:", error);
            return of(
              AccountActions.loadAccountFailure({
                error: error.message || error,
              }),
            );
          }),
        ),
      ),
    ),
  );

  // Create Account
  createAccount$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AccountActions.createAccount),
      switchMap(({account}) =>
        from(this.firestoreService.addDocument("accounts", account)).pipe(
          map((accountId) => {
            if (accountId) {
              return AccountActions.createAccountSuccess({
                account: {...account, id: accountId},
              });
            } else {
              return AccountActions.createAccountFailure({
                error: "Failed to create account",
              });
            }
          }),
          catchError((error) =>
            of(AccountActions.createAccountFailure({error})),
          ),
        ),
      ),
    ),
  );

  // Update Account
  updateAccount$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AccountActions.updateAccount),
      switchMap(({account}) =>
        from(
          this.firestoreService.updateDocument("accounts", account.id, account),
        ).pipe(
          map(() => AccountActions.updateAccountSuccess({account})),
          catchError((error) =>
            of(AccountActions.updateAccountFailure({error})),
          ),
        ),
      ),
    ),
  );

  // Delete Account
  deleteAccount$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AccountActions.deleteAccount),
      switchMap(({accountId}) =>
        from(this.firestoreService.deleteDocument("accounts", accountId)).pipe(
          map(() => AccountActions.deleteAccountSuccess({accountId})),
          catchError((error) =>
            of(AccountActions.deleteAccountFailure({error})),
          ),
        ),
      ),
    ),
  );

  // Search Accounts
  searchAccounts$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AccountActions.searchAccounts),
      switchMap(({query}) =>
        from(
          this.firestoreService.searchAccountByName(
            "accounts",
            query,
            undefined,
          ),
        ).pipe(
          map((accountsData) => {
            const accounts: Account[] = (accountsData || []).map(
              (accountData) => ({
                ...(accountData as Account),
              }),
            );
            return AccountActions.searchAccountsSuccess({accounts});
          }),
          catchError((error) =>
            of(AccountActions.searchAccountsFailure({error})),
          ),
        ),
      ),
    ),
  );

  // Using deleteDocumentAtPath (Correct)
  deleteRelatedAccount$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AccountActions.deleteRelatedAccount),
      mergeMap(({accountId, relatedAccountId}) =>
        from(
          this.firestoreService.deleteDocumentAtPath(
            `accounts/${accountId}/relatedAccounts/${relatedAccountId}`,
          ),
        ).pipe(
          map(() =>
            AccountActions.deleteRelatedAccountSuccess({
              accountId,
              relatedAccountId,
            }),
          ),
          catchError((error) =>
            of(AccountActions.deleteRelatedAccountFailure({error})),
          ),
        ),
      ),
    ),
  );

  // Load Related Accounts
  loadRelatedAccounts$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AccountActions.loadRelatedAccounts),
      switchMap(({accountId}) =>
        this.firestoreService.getRelatedAccounts(accountId).pipe(
          map((relatedAccounts) =>
            AccountActions.loadRelatedAccountsSuccess({relatedAccounts}),
          ),
          catchError((error) =>
            of(AccountActions.loadRelatedAccountsFailure({error})),
          ),
        ),
      ),
    ),
  );

  // Update Related Account
  updateRelatedAccount$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AccountActions.updateRelatedAccount),
      switchMap(({accountId, relatedAccount}) =>
        from(
          this.firestoreService.updateDocument(
            `accounts/${accountId}/relatedAccounts`,
            relatedAccount.id,
            relatedAccount,
          ),
        ).pipe(
          map(() =>
            AccountActions.updateRelatedAccountSuccess({relatedAccount}),
          ),
          catchError((error) =>
            of(AccountActions.updateRelatedAccountFailure({error})),
          ),
        ),
      ),
    ),
  );
}
