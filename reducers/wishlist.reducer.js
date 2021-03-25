export default function wishlistReducer(wishList = [], action) {
    if(action.type === 'addToWishList'){
    var wishListCopy = [...wishList];        
    var findBook = false;          
        for(let i=0;i<wishListCopy.length;i++){             
                if(wishListCopy[i].bookId === action.bookInfo.bookId){                 
                    findBook = true             
                };         
        }          
        if(!findBook){             
                wishListCopy.push(action.bookInfo)         
        }                  
        return wishListCopy
    } else if (action.type === 'DeleteToWishList') {
        var wishListCopy2 = [...wishList];
        wishListCopy2.splice(action.index,1)     
        return wishListCopy2
    } else if (action.type === 'setWishlist') {
        return action.wishlist   
    } else {
        return wishList
    } 
}

