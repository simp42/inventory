import assert from "assert";
import * as Realm from "realm-web";

export type CurrentUserId = string | null;
export type CurrentUserProfile = globalThis.Realm.UserProfile | null;

export default class CurrentUser {
    private readonly app: Realm.App;

    constructor(app: Realm.App) {
        this.app = app;
    }

    isLoggedIn(): boolean {
        const isLoggedIn = this.app !== null && this.app.currentUser !== null && this.app.currentUser.isLoggedIn;
        return isLoggedIn || false;
    }

    async isAdmin(): Promise<boolean> {
        // @ts-ignore
        if (window.__inventory_is_admin) {
            // @ts-ignore
            return window.__inventory_is_admin;
        }

        const isAdminResult: boolean = await this.app.currentUser?.functions.isAdmin();

        // @ts-ignore
        window.__inventory_is_admin = isAdminResult;

        return isAdminResult;
    }

    async logout(): Promise<void> {
        return this.app.currentUser?.logOut();
    }

    async login(email: string, password: string): Promise<boolean> {
        if (this.isLoggedIn()) {
            return true;
        }

        const credentials = Realm.Credentials.emailPassword(email, password);

        try {
            const user: Realm.User = await this.app.logIn(credentials);
            assert(user.id === this.app.currentUser?.id);
            return true;
        } catch (e) {
            if (e.error) {
                alert(e.error);
                return false;
            }

            console.error(e);
            alert(e);
        }

        return false;
    }

    id(): CurrentUserId {
        if (!this.isLoggedIn()) {
            return null;
        }

        if (this.app.currentUser === null) {
            return null;
        }

        return this.app.currentUser.id;
    }

    profile(): CurrentUserProfile {
        if (!this.isLoggedIn()) {
            return null;
        }

        return this.app.currentUser?.profile || null;
    }
}
