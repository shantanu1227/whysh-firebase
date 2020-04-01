const taskModel = require('../models/tasks');

function taskListMapper(id, _task) {
    let categories = _task.categories?[]:null;
    if (_task.categories) {
        _task.categories.forEach(category => {
            categories.push({
                name: category.name,
            });
        });
    }
    return {
        id: id,
        task: _task.task,
        address: {
            flat: _task.address.flat,
            street1: _task.address.street1,
            street2: _task.address.street2,
            pincode: _task.address.pincode,
            city: _task.address.city,
            country: _task.address.country,
            location: {
                latitude: _task.address.location.latitude,
                longitude: _task.address.location.longitude
            }
        },
        status: _task.status,
        categories: categories,
        createdAt: _task.createdAt?_task.createdAt.toDate():new Date()
    }
}

function taskDetailMapper(id, data) {
    let taskData = taskListMapper(id, data);
    taskData.createdBy = {
        name: data.createdBy.name,
        phone: data.createdBy.phone
    }
    taskData.assignedTo = null;
    if (data.assignedTo) {
        taskData.assignedTo = {
            name: data.assignedTo.name,
            phone: data.assignedTo.phone
        }
    }
    return taskData;
}

function createTask(_req, res) {
    taskModel.create(_req.user, _req.body.address, _req.body.categories, _req.body.task).then((task) => {
        return res.status(201).json({
            success: true,
            task: taskDetailMapper(task.id, {
                task:_req.body.task,
                categories: _req.body.categories,
                address: _req.body.address,
                createdBy: _req.user,
                assignedTo: null
            })
        })
    }).catch((error) => {
        console.error('Error creating task', error);
        return res.status(400).json({
            success: false,
            message: error.message
        })
    })
}

function getUserTasks(_req, res) {
    const userType = _req.params.userType;
    const page = _req.query.page?_req.query.page:null;
    const pageSize = 50;
    if (!taskModel.TASK_USER_TYPES.includes(userType)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid user type'
        })
    }
    let status = null;
    if (userType === taskModel.TASK_USER_TYPE_ASSIGNER) {
        status = taskModel.TASK_STATUS_ASSIGNED;
    }
    taskModel.list(page, pageSize, null, status, _req.user.id, userType).then((paginate) => {
        let tasks = [];
        paginate.docs.forEach(doc => {
            tasks.push(taskDetailMapper(doc.ref.id, doc.data()));
        });
        return res.json({
            success: true,
            tasks: tasks,
            next: paginate.next
        })
    }).catch((error) => {
        console.error('Error fetching pending task', error);
        return res.status(400).json({
            success: false,
            message: error.message
        })
    })
}

function getPendingTasks(_req, res) {
    const pincode = _req.params.pincode;
    const page = _req.query.page?_req.query.page:null;
    const pageSize = 50;
    taskModel.list(page, pageSize, pincode, taskModel.TASK_STATUS_PENDING, null, null, _req.user.id).then((paginate) => {
        let tasks = [];
        paginate.docs.forEach(doc => {
            tasks.push(taskListMapper(doc.ref.id, doc.data()));
        });
        return res.json({
            success: true,
            tasks: tasks,
            next: paginate.next
        })
    }).catch((error) => {
        console.error('Error fetching pending task', error);
        return res.status(400).json({
            success: false,
            message: error.message
        })
    })
}

function assignTask(_req, res) {
    const taskId = _req.params.taskId;
    taskModel.assign(taskId, _req.user).then((data) => {
        let updatedData = Object.assign({}, data.doc.data(), data.updatedData);
        return res.json({
            success: true,
            task:taskDetailMapper(data.doc.id, updatedData)
        })
    }).catch((error) => {
        console.error('Error assigning pending task', error);
        return res.status(400).json({
            success: false,
            message: error.message
        })
    });
}

function completeTask(_req, res) {
    const taskId = _req.params.taskId;
    taskModel.complete(taskId, _req.user).then((data) => {
        let updatedData = Object.assign({}, data.doc.data(), data.updatedData);
        return res.json({
            success: true,
            task:taskDetailMapper(data.doc.id, updatedData)
        })
    }).catch((error) => {
        console.error('Error completing task', error);
        return res.status(400).json({
            success: false,
            message: error.message
        })
    });
}

function cancelTask(_req, res) {
    const taskId = _req.params.taskId;
    taskModel.cancel(taskId, _req.user).then((data) => {
        let updatedData = Object.assign({}, data.doc.data(), data.updatedData);
        return res.json({
            success: true,
            task:taskDetailMapper(data.doc.id, updatedData)
        })
    }).catch((error) => {
        console.error('Error cancelling task', error);
        return res.status(400).json({
            success: false,
            message: error.message
        })
    });
}

module.exports = {
    createTask,
    getPendingTasks,
    getUserTasks,
    assignTask,
    completeTask,
    cancelTask
}