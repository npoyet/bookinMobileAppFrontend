export default function avatarReducer(avatar = null, action) {
    if(action.type==='saveAvatar'){
        return action.avatar ;
    } else {
        return avatar;
    }
}