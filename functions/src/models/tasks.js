const firestore = require('./firestore').firestore;
const geopoint = require('@google-cloud/firestore').GeoPoint;
const timeStamp = require('@google-cloud/firestore').Timestamp;
const modelHelper = require('./helper');
const TASK_STATUS_PENDING = 'pending';
const TASK_STATUS_ASSIGNED = 'assigned';
const TASK_STATUS_COMPLETED = 'completed';
const TASK_STATUS_CANCELLED = 'cancelled';
const TASK_USER_TYPE_CREATOR = 'creator';
const TASK_USER_TYPE_ASSIGNER = 'assignee';
const TASK_USER_TYPES = [TASK_USER_TYPE_CREATOR, TASK_USER_TYPE_ASSIGNER];

function createUserSubCollection(user) {
    return {
        _id: user.id,
        id: firestore.collection(modelHelper.USER_COLLECTION).doc(user.id),
        name: user.name,
        phone: user.phone
    }
}

function create(user, address, categories, task) {
    try {
        address.location = new geopoint(address.location.latitude, address.location.longitude);
        address.pincode = parseInt(address.pincode);
        let createdBy = createUserSubCollection(user);
        let categoriesDb = [];
        categories.forEach(category => {
            let categoryObject = {
                id: firestore.collection(modelHelper.CATEGORY_COLLECTION).doc(category.id),
                name: category.name
            }
            categoriesDb.push(categoryObject);
        });
        let data = {
            status: TASK_STATUS_PENDING,
            categories: categoriesDb,
            address: address,
            pincode: parseInt(address.pincode),
            task: task,
            createdBy: createdBy,
            assignedTo: null,
            cancelledAt: null,
            completedAt: null,
            createdAt: new Date(),
            updatedAt: new Date()
        }
        return firestore.collection(modelHelper.TASK_COLLECTION).add(data);
    } catch (error) {
        return Promise.reject(error);
    }
}

function list(page, pageSize, pincode = null, status = null, userId = null, userType = null, excludeUserId = null) {
    const field = 'createdAt';
    let ref = firestore.collection(modelHelper.TASK_COLLECTION);
    if (pincode !== null) {
        ref = ref.where('pincode', '==', parseInt(pincode))
    }
    if (userId !== null && userType !== null) {
        if (userType === TASK_USER_TYPE_CREATOR) {
            ref = ref.where('createdBy._id', '==', userId);
        } else if (userType === TASK_USER_TYPE_ASSIGNER) {
            ref = ref.where('assignedTo._id', '==', userId);
        }
    }
    if (status !== null) {
        ref = ref.where('status', '==', status)
    }
    if (page !== null) {
        page = timeStamp.fromDate(new Date(page));
    } else {
        page = timeStamp.fromDate(new Date());
    }
    if (excludeUserId !== null) {
        return modelHelper.paginate(ref, field, page, pageSize).then((data) => {
            let filteredDocs = [];
            data.docs.forEach(doc => {
                if (doc.get('createdBy._id') !== excludeUserId) {
                    filteredDocs.push(doc);
                }
            });
            return Promise.resolve({ docs: filteredDocs, next: data.next });
        }).catch((error) => {
            return Promise.reject(error);
        });
    } else {
        return modelHelper.paginate(ref, field, page, pageSize);
    }
}

function getTaskRef(id) {
    return firestore.collection(modelHelper.TASK_COLLECTION).doc(id)
}

function get(id) {
    return getTaskRef(id).get();
}

function assign(id, user) {
    let assignedTo = createUserSubCollection(user);
    let taskRef = getTaskRef(id);
    let transaction = firestore.runTransaction(t => {
        return t.get(taskRef)
            .then(doc => {
                if (doc.exists) {
                    if (assignedTo._id === doc.get('createdBy._id')) {
                        return Promise.reject(Error('Cannot assign to self.'));
                    }
                    let status = doc.data().status;
                    if (status === TASK_STATUS_PENDING) {
                        const updatedData = { assignedTo: assignedTo, status: TASK_STATUS_ASSIGNED, updatedAt: new Date() };
                        t.update(taskRef, updatedData);
                        return Promise.resolve({ doc, updatedData });
                    }
                } else {
                    return Promise.reject(Error('Document does not exists.'));
                }
                return Promise.reject(Error('Invalid task state'));
            });
    });
    return transaction;
}

function cancel(id, user) {
    let updatedData = { status: TASK_STATUS_CANCELLED, cancelledAt: new Date(), updatedAt: new Date() }
    return getTaskRef(id).get()
        .then(doc => {
            if (doc.exists) {
                if (doc.data().status !== TASK_STATUS_CANCELLED) {
                    if (doc.get('createdBy._id') === user.id) {
                        getTaskRef(id).update(updatedData);
                        return Promise.resolve({ doc, updatedData });
                    } else {
                        return Promise.reject(Error('Document does not belong to user.'));
                    }
                }
            } else {
                return Promise.reject(Error('Document does not exists.'));
            }
            return Promise.reject(Error('Invalid task state'));
        });
}

function complete(id, user) {
    let updatedData = { status: TASK_STATUS_COMPLETED, completedAt: new Date(), updatedAt: new Date() }
    return getTaskRef(id).get()
        .then(doc => {
            if (doc.exists) {
                if (doc.data().status === TASK_STATUS_ASSIGNED) {
                    if (doc.get('createdBy._id') === user.id) {
                        getTaskRef(id).update(updatedData);
                        return Promise.resolve({ doc, updatedData });
                    } else {
                        return Promise.reject(Error('Document does not belong to user.'));
                    }
                }
            } else {
                return Promise.reject(Error('Document does not exists.'));
            }
            return Promise.reject(Error('Invalid task state'));
        });
}

module.exports = {
    create,
    list,
    get,
    assign,
    cancel,
    complete,
    TASK_STATUS_PENDING,
    TASK_STATUS_ASSIGNED,
    TASK_USER_TYPES,
    TASK_USER_TYPE_ASSIGNER
}