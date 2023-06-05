class APIFeature {
  constructor(query,queryString) {
    this.query = query;
    this.queryString = queryString;
  }
  filter(){
    const queryObj = {... this.queryString};
    const excludedFields = ['sort','page','limit','fields'];
    excludedFields.forEach(el=> delete queryObj[el]);

    this.query= this.query.find(queryObj)

    return this;
  }
  sorts(){
    if (this.queryString.sort){
      const sortBy = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy)
    }

    return this;
  }
  limitFields(){
    if (this.queryString.fields){
      const fields = this.queryString.fields.split(',').join(' ');
      console.log(fields);
      this.query = this.query.select(fields)
    }
    else {
      this.query = this.query.select('-__v')
    }
    return this;
  }

  paginate(){
    const page = (this.queryString.page * 1) || 1 ;
    const limit = (this.queryString.limit * 1) || 100 ;
    const skip = (page-1) * limit;
    this.query = this.query.skip(skip).limit(limit);

    return this;
  }

}
module.exports = APIFeature;