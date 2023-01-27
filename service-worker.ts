// include the existing built-in lib: WebWorker
// for more info see https://github.com/microsoft/TypeScript/issues/11781
/// <reference lib="WebWorker" />

/**
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { offlineFallback } from 'workbox-recipes'
import { setDefaultHandler } from 'workbox-routing'
import { StaleWhileRevalidate } from 'workbox-strategies'

// convert the type of "self" to the type of service worker context
const sw: ServiceWorkerGlobalScope = self as any

// @ts-ignore: self.__WB_MANIFEST is a placeholder that Workbox replaces with the precache manifest.
const assetHashes = self.__WB_MANIFEST
console.log(assetHashes)

// Cache first if available, and always make a revalidation request to update cache, regardless of the age of the cached response.
setDefaultHandler(new StaleWhileRevalidate())

// HTML to serve when the site is offline
offlineFallback({
  pageFallback: './offline.html'
})
