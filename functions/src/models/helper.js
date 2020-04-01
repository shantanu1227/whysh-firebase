const timeStamp = require('@google-cloud/firestore').Timestamp;
const TASK_COLLECTION = 'tasks';
const CATEGORY_COLLECTION = 'categories';
const USER_COLLECTION = 'users';

function nextPage(ref, last, field, pageSize) {
    last = last?last.data()[field]:null;
    return ref.orderBy(field).startAfter(last).limit(pageSize);
}

function lastPage(ref, first, field, pageSize) {
    return ref.orderBy(field).endBefore(first[field]).limit(pageSize);
}

function paginate(ref, field, page, pageSize) {
    const query = ref.orderBy(field).startAfter(page).limit(pageSize);
    return query.get()
    .then((snapshot) => {
        let last = snapshot.docs.length > 0 ?snapshot.docs[snapshot.docs.length - 1]:null;
        let next = nextPage(ref, last, field, pageSize);
        return next.get().then((_snapshot)=> {
            let nextValue = _snapshot.docs.length > 0?_snapshot.docs[0].data()[field]:null
            if (nextValue !== null && nextValue instanceof timeStamp) {
                nextValue = nextValue.toDate();
            }
            return {
                next: nextValue,
                docs: snapshot.docs
            };
        });
    });
}

module.exports = {
    nextPage,
    lastPage,
    paginate,
    USER_COLLECTION,
    CATEGORY_COLLECTION,
    TASK_COLLECTION
}