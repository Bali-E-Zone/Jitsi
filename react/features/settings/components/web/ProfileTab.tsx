import { Theme } from '@mui/material';
import React from 'react';
import { WithTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import { withStyles } from 'tss-react/mui';

import { createProfilePanelButtonEvent } from '../../../analytics/AnalyticsEvents';
import { sendAnalytics } from '../../../analytics/functions';
import { IStore } from '../../../app/types';
import { login, logout } from '../../../authentication/actions.web';
import Avatar from '../../../base/avatar/components/Avatar';
import AbstractDialogTab, {
    IProps as AbstractDialogTabProps } from '../../../base/dialog/components/web/AbstractDialogTab';
import { translate } from '../../../base/i18n/functions';
import Button from '../../../base/ui/components/web/Button';
import Input from '../../../base/ui/components/web/Input';

/**
 * The type of the React {@code Component} props of {@link ProfileTab}.
 */
export interface IProps extends AbstractDialogTabProps, WithTranslation {

    /**
     * Whether server-side authentication is available.
     */
    authEnabled: boolean;

    /**
     * The name of the currently (server-side) authenticated user.
     */
    authLogin: string;

    /**
     * CSS classes object.
     */
    classes?: Partial<Record<keyof ReturnType<typeof styles>, string>>;

    /**
     * Invoked to change the configured calendar integration.
     */
    dispatch: IStore['dispatch'];

    /**
     * The display name to display for the local participant.
     */
    displayName: string;

    /**
     * The email to display for the local participant.
     */
    email: string;

    /**
     * Whether to hide the email input in the profile settings.
     */
    hideEmailInSettings?: boolean;

    /**
     * The id of the local participant.
     */
    id: string;

    /**
     * If the display name is read only.
     */
    readOnlyName: boolean;
}

const styles = (theme: Theme) => {
    return {
        container: {
            display: 'flex',
            flexDirection: 'column' as const,
            width: '100%',
            padding: '0 2px'
        },

        avatarContainer: {
            display: 'flex',
            width: '100%',
            justifyContent: 'center',
            marginBottom: theme.spacing(4)
        },

        bottomMargin: {
            marginBottom: theme.spacing(4)
        },

        label: {
            color: `${theme.palette.text01} !important`,
            ...theme.typography.bodyShortRegular,
            marginBottom: theme.spacing(2)
        },

        name: {
            marginBottom: theme.spacing(1)
        }
    };
};

/**
 * React {@code Component} for modifying the local user's profile.
 *
 * @augments Component
 */
class ProfileTab extends AbstractDialogTab<IProps, any> {
    static defaultProps = {
        displayName: '',
        email: ''
    };

    /**
     * Initializes a new {@code ConnectedSettingsDialog} instance.
     *
     * @param {IProps} props - The React {@code Component} props to initialize
     * the new {@code ConnectedSettingsDialog} instance with.
     */
    constructor(props: IProps) {
        super(props);

        // Bind event handlers so they are only bound once for every instance.
        this._onAuthToggle = this._onAuthToggle.bind(this);
        this._onEmailChange = this._onEmailChange.bind(this);
        this._onFamilyNameChange = this._onFamilyNameChange.bind(this);
        this._onGivenNameChange = this._onGivenNameChange.bind(this);
    }

    /**
     * Changes given name of the user.
     *
     * @param {string} value - The new given name.
     *
     * @returns {void}
     */
    _onGivenNameChange(value: string) {
        const userData = JSON.parse(localStorage.getItem('zitadel_user_data') || '{}');
        userData.given_name = value;
        localStorage.setItem('zitadel_user_data', JSON.stringify(userData));

        // Update display name as well
        const displayName = value && userData.family_name
            ? `${value} ${userData.family_name}`
            : value || userData.family_name || '';

        super._onChange({
            displayName,
            givenName: value
        });
    }

    /**
     * Changes family name of the user.
     *
     * @param {string} value - The new family name.
     *
     * @returns {void}
     */
    _onFamilyNameChange(value: string) {
        const userData = JSON.parse(localStorage.getItem('zitadel_user_data') || '{}');

        userData.family_name = value;
        localStorage.setItem('zitadel_user_data', JSON.stringify(userData));

        // Update display name as well
        const displayName = value && userData.given_name
            ? `${userData.given_name} ${value}`
            : value || userData.given_name || '';

        super._onChange({
            displayName,
            familyName: value
        });
    }

    /**
     * Changes email of the user.
     *
     * @param {string} value - The key event to handle.
     *
     * @returns {void}
     */
    _onEmailChange(value: string) {
        const userData = JSON.parse(localStorage.getItem('zitadel_user_data') || '{}');
        
        userData.email = value;
        localStorage.setItem('zitadel_user_data', JSON.stringify(userData));
        
        super._onChange({ email: value });
    }

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     * @returns {ReactElement}
     */
    override render() {
        // Get user data from ZITADEL
        const userData = JSON.parse(localStorage.getItem('zitadel_user_data') || '{}');
        const {
            authEnabled,
            email: propEmail,
            hideEmailInSettings,
            id,
            readOnlyName,
            t
        } = this.props;

        // Use ZITADEL data if available, otherwise fall back to props
        const givenName = userData.given_name || '';
        const familyName = userData.family_name || '';
        const email = userData.email || userData.preferred_username || propEmail || '';

        // Check if we have ZITADEL user data
        const hasZitadelData = !!(userData.given_name || userData.family_name || userData.email);
        const classes = withStyles.getClasses(this.props);

        return (
            <div className = { classes.container } >
                <div className = { classes.avatarContainer }>
                    <Avatar
                        participantId = { id }
                        size = { 60 } />
                </div>
                <div className = 'name-fields-container' >
                    <div className = 'name-field' >
                        <Input
                            className = { classes.bottomMargin }
                            disabled = { readOnlyName || hasZitadelData }
                            id = 'setGivenName'
                            label = { t('profile.givenNameLabel', { defaultValue: 'First Name' }) }
                            name = 'givenName'
                            onChange = { this._onGivenNameChange }
                            placeholder = { t('profile.givenNamePlaceholder', { defaultValue: 'First Name' }) }
                            readOnly = { hasZitadelData }
                            type = 'text'
                            value = { givenName } />
                    </div>
                    <div className = 'name-field' >
                        <Input
                            className = { classes.bottomMargin }
                            disabled = { readOnlyName || hasZitadelData }
                            id = 'setFamilyName'
                            label = { t('profile.familyNameLabel', { defaultValue: 'Last Name' }) }
                            name = 'familyName'
                            onChange = { this._onFamilyNameChange }
                            placeholder = { t('profile.familyNamePlaceholder', { defaultValue: 'Last Name' }) }
                            readOnly = { hasZitadelData }
                            type = 'text'
                            value = { familyName } />
                    </div>
                </div>
                {!hideEmailInSettings && <div className = 'profile-edit-field'>
                    <Input
                        className = { classes.bottomMargin }
                        disabled = { readOnlyName || hasZitadelData }
                        id = 'setEmail'
                        label = { t('profile.setEmailLabel') }
                        name = 'email'
                        onChange = { this._onEmailChange }
                        placeholder = { t('profile.setEmailInput') }
                        readOnly = { hasZitadelData }
                        type = 'email'
                        value = { email } />
                </div>}
                { authEnabled && this._renderAuth() }
            </div>
        );
    }

    /**
     * Shows the dialog for logging in or out of a server and closes this
     * dialog.
     *
     * @private
     * @returns {void}
     */
    _onAuthToggle() {
        if (this.props.authLogin) {
            sendAnalytics(createProfilePanelButtonEvent('logout.button'));

            this.props.dispatch(logout());
        } else {
            sendAnalytics(createProfilePanelButtonEvent('login.button'));

            this.props.dispatch(login());
        }
    }

    /**
     * Returns a React Element for interacting with server-side authentication.
     *
     * @private
     * @returns {ReactElement}
     */
    _renderAuth() {
        const {
            authLogin,
            t
        } = this.props;
        const classes = withStyles.getClasses(this.props);

        return (
            <div>
                <h2 className = { classes.label }>
                    { t('toolbar.authenticate') }
                </h2>
                { authLogin
                    && <div className = { classes.name }>
                        { t('settings.loggedIn', { name: authLogin }) }
                    </div> }
                <Button
                    accessibilityLabel = { authLogin ? t('toolbar.logout') : t('toolbar.login') }
                    id = 'login_button'
                    label = { authLogin ? t('toolbar.logout') : t('toolbar.login') }
                    onClick = { this._onAuthToggle } />
            </div>
        );
    }
}

export default withStyles(translate(connect()(ProfileTab)), styles);
