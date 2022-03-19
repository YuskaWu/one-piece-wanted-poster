interface AppState {
  avatarUrl: string
  name: string
  bounty: string | number
  filter: string
  padding: number
}

const store = new Proxy<AppState>(
  {
    avatarUrl: '',
    name: '',
    bounty: '',
    filter: '',
    padding: 0
  },
  {
    set: function (target, key, value) {
      console.log(
        `${target} The property ${key.toString()} has been updated with ${value}`
      )
      return true
    }
  }
)

export default store
