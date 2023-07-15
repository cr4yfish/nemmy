    /**
     * Valid usernames have
     * - No spaces
     * - No Uppercase characters
     * @param username: string
     * @returns boolean 
     */
    export const validateUsername = (username: string) => {
        const pattern = /(?!.*[\_]{2,})^[a-zA-Z0-9\_]{3,21}$/gm;
        return pattern.test(username);
    }

    /**
     * Valid passwords have:
     * - At least 8 characters
     * - At least one uppercase letter
     * - At least one lowercase letter
     * - At least one number
     * - At least one special character
     * @param password: string
     * @returns boolean
     */
    export const validatePassword = (password: string) => {
        const pattern = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/;
        return pattern.test(password);
    }

    /**
    * Checks if password is strong
    * 15-100 length
    * no consecutive chars
    * 2 lowers
    * 2 uppers
    * 2 specials
    * 2 digits
     * @param password 
     * @returns 
     */
    export const validatePasswordStrong = (password: string) => {
        const pattern = /^(?!.*(.)\1{1})(?=(.*[\d]){2,})(?=(.*[a-z]){2,})(?=(.*[A-Z]){2,})(?=(.*[@#$%!]){2,})(?:[\da-zA-Z@#$%!]){15,100}$/;
        return pattern.test(password);
    }

    /**
     * Verifys a string only contains ASCII characters
     * @param str: string
     * @returns boolean
     */
    export const verifyASCII = (str: string) => {
        const pattern = /^[\x00-\x7F]+$/;
        return pattern.test(str);
    }