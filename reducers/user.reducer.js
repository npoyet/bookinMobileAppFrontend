export default function userReducer(user = null, action) {
    if(action.type==='saveUser'){
        return action.user ;
    } else if (action.type==='deleteUser'){
        const LogOutUser = null;
        return LogOutUser;
    } else {
        return user;
    }
}