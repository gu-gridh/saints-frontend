import ExploreCults from '@/components/ExploreCults.vue'
import ExplorePeople from '@/components/ExplorePeople.vue'
import ExplorePlaces from '@/components/ExplorePlaces.vue'
import ExploreSaints from '@/components/ExploreSaints.vue'

import ShowCult from '@/components/ShowCult.vue'
import ShowPerson from '@/components/ShowPerson.vue'
import ShowPlace from '@/components/ShowPlace.vue'

const definitions = {
  places: {
    state: {
      types: null,
      placeTypes: null,
      diocese: '',
    },
    routes: {
      explore: { name: 'places', component: ExplorePlaces },
      show: { name: 'place', component: ShowPlace },
    },
    buildParams(state) {
      const params = {}

      const ids = state.placeTypes?.length
        ? state.placeTypes
        : state.types

      if (ids?.length) {
        params.ids = ids.join(',')
      }

      if (state.diocese) {
        params.med_diocese = state.diocese
      }

      return params
    },
  },

  saints: {
    state: {
      sex: 'all',
      types: [],
      saints: [],
    },
    routes: {
      explore: { name: 'saints', component: ExploreSaints },
      show: {
        name: 'saint',
        component: ShowPerson,
        props: { type: 'saint' },
      },
    },
    buildParams(state) {
      const params = {}

      if (state.saints?.length) {
        params.agent = state.saints.join(',')
      } else if (state.types?.length) {
        params.ids = state.types.join(',')
      }

      if (state.sex && state.sex !== 'all') {
        params.gender = state.sex
      }

      return params
    },
  },

  cults: {
    state: {
      types: [],
      areas: [],
      filterType: [],
      dioceseState: null,
      extant: null,
    },
    routes: {
      explore: { name: 'cults', component: ExploreCults },
      show: { name: 'cult', component: ShowCult },
    },
    buildParams(state) {
      const params = {}

      const ids =
        state.filterType?.length
          ? state.filterType
          : state.types?.length
            ? state.types
            : state.areas?.length
              ? state.areas
              : null

      if (ids?.length) {
        params.ids = ids.join(',')
      }

      if (state.dioceseState) {
        params.med_diocese = state.dioceseState
      }

      if (state.extant) {
        params.extant = state.extant
      }

      return params
    },
  },

  people: {
    state: {
      sex: 'all',
      types: [],
      people: [],
    },
    routes: {
      explore: { name: 'people', component: ExplorePeople },
      show: {
        name: 'person',
        component: ShowPerson,
        props: { type: 'person' },
      },
    },
    buildParams(state) {
      const params = {}

      if (state.people?.length) {
        params.agent = state.people.join(',')
      } else if (state.types?.length) {
        params.ids = state.types.join(',')
      }

      if (state.sex && state.sex !== 'all') {
        params.gender = state.sex
      }

      return params
    },
  },

  advanced: {
    state: {
      cultType: [],
      placeType: [],
      personType: [],
      placeTypes: [],
      personName: [],
      dioceseState: null,
    },
    buildParams(state) {
      const params = {}

      if (state.personName?.length) {
        params.agent = state.personName.join(',')
      }

      if (state.personType?.length) {
        params.agent_type = state.personType.join(',')
      }

      if (state.cultType?.length) {
        params.type = state.cultType.join(',')
      }

      if (state.placeType?.length) {
        params.place_type = state.placeType.join(',')
      }

      if (state.dioceseState) {
        params.med_diocese = state.dioceseState
      }

      return params
    },
  },
}

function cloneState(state) {
  if (typeof structuredClone === 'function') {
    return structuredClone(state)
  }

  return JSON.parse(JSON.stringify(state))
}

export function getInitialQueryState() {
  return cloneState({
    mode: 'places',
    selectionSummary: '',
    places: { ...definitions.places.state },
    saints: { ...definitions.saints.state },
    cults: { ...definitions.cults.state },
    people: { ...definitions.people.state },
    advanced: { ...definitions.advanced.state },
  })
}

export function buildMapParams(queryState, mapArgs = {}) {
  const mode = queryState?.mode || 'places'
  const modeDefinition = definitions[mode]

  if (!modeDefinition) {
    console.warn(`Unknown query mode: ${mode}`)
    return new URLSearchParams()
  }

  const modeState = queryState[mode] || {}
  const params = new URLSearchParams()

  params.set('mode', mode)

  if (mapArgs.zoom != null) {
    params.set('zoom', mapArgs.zoom)
  }

  if (mapArgs.range) {
    params.set('range', mapArgs.range)
  }

  const modeParams = modeDefinition.buildParams(modeState)

  Object.entries(modeParams).forEach(([key, value]) => {
    if (value != null && value !== '') {
      params.set(key, value)
    }
  })

  return params
}

export function routes() {
  return Object.keys(definitions).reduce((routes, key) => {
    const definition = definitions[key]

    if (definition.routes?.explore) {
      routes.push({
        path: key,
        ...definition.routes.explore,
      })
    }

    if (definition.routes?.show) {
      routes.push({
        path: `${key}/:id`,
        ...definition.routes.show,
      })
    }

    return routes
  }, [])
}

export function getFeatureId(featureOrProps) {
  if (!featureOrProps) return null

  if (typeof featureOrProps.getId === 'function') {
    return featureOrProps.getId()
  }

  if (typeof featureOrProps.get === 'function') {
    return featureOrProps.get('id')
  }

  return (
    featureOrProps.id ||
    featureOrProps.place_id ||
    featureOrProps.cult_id ||
    featureOrProps.person_id ||
    featureOrProps.properties?.id ||
    featureOrProps.properties?.place_id ||
    featureOrProps.properties?.cult_id ||
    featureOrProps.properties?.person_id ||
    null
  )
}

export function onFeatureClick(featureOrProps, { router, mode = 'places' } = {}) {
  const id = getFeatureId(featureOrProps)

  if (!id) {
    console.warn('Clicked feature has no id', featureOrProps)
    return
  }

  if (mode === 'saints') {
    router.push(`/explore/saints/${id}`)
    return
  }

  if (mode === 'people') {
    router.push(`/explore/people/${id}`)
    return
  }

  if (mode === 'cults' || mode === 'advanced') {
    router.push(`/explore/cults/${id}`)
    return
  }

  router.push(`/explore/places/${id}`)
}

export function getRelationsCond() {
  return null
}

export async function getSelectionSummary() {
  return undefined
}

export function composeQuery(parts) {
  // compose subqueries for each part
  // if there are more parts than one, combine these with the and operator
  let query = parts.map(({ field, op, sstring }) => {
    // In the API, negation is separate from the operator
    op = op ? op.replace("not_", "not||") : "equals";
    return `${op}|${field}|${sstring}`;
  });
  if (query.length > 1) {
    query = ["and", ...query].join("||");
  } else {
    query = query[0];
  }
  return query;
}