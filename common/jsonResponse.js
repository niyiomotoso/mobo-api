
exports.success = (data, message)=> {
  return {"status": "success", "code": 1,"message": message,  "data": data};
}

exports.failure = (slug, message)=> {
    return {"status": "failed", "code": 0, slug: slug, "message": message};
  }