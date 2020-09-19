export class Storage {
  constructor(schema, onChanged) {
    this.schema = schema
    this.onChanged = onChanged

    this.init()
    this.registerSchema(schema)

  }

  async init() {
    await this.registerSchema(this.schema)
    await this.addOnChangedListener(this.onChanged)
  }

  async registerSchema(schema) {

  }

  async addOnChangedListener(onChanged) {

  }
}