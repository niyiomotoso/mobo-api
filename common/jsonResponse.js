
exports.success = (data, message)=> {
  return {"status": "success", "code": 1,"message": message,  "data": data};
}

exports.failure = (message)=> {
    return {"status": "failed", "code": 0, "message": message};
  }