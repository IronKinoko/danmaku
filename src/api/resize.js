export default function () {
  this._.stage.width = this.container.offsetWidth
  this._.stage.height = this.container.offsetHeight
  this._.engine.resize(this._.stage)
  this._.duration = this._.stage.width / this._.speed
  this.refresh()
  return this
}
