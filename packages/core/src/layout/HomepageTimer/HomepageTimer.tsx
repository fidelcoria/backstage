/*
 * Copyright 2020 Spotify AB
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React from 'react';
import { HeaderLabel } from '../HeaderLabel';
import { ConfigApi, useApi, configApiRef } from '@backstage/core-api';

const timeFormat = { hour: '2-digit', minute: '2-digit' };

type TimeObj = {
  time: string;
  label: string;
};

function getTimes(configApi: ConfigApi) {
  const d = new Date();
  const lang = window.navigator.language;

  const clocks: TimeObj[] = [];

  if (!configApi.has('homepage.clocks')) {
    return clocks;
  }

  const clockConfigs = configApi.getConfigArray('homepage.clocks');

  for (const clock of clockConfigs) {
    if (clock.has('label') && clock.has('timezone')) {
      const options = {
        timeZone: clock.getString('timezone'),
        ...timeFormat,
      };

      const time = d.toLocaleTimeString(lang, options);
      const label = clock.getString('label');

      clocks.push({ time, label });
    }
  }

  return clocks;
}

export const HomepageTimer = () => {
  const configApi = useApi(configApiRef);

  const defaultTimes: TimeObj[] = [];
  const [clocks, setTimes] = React.useState(defaultTimes);

  React.useEffect(() => {
    setTimes(getTimes(configApi));

    const intervalId = setInterval(() => {
      setTimes(getTimes(configApi));
    }, 1000);

    return () => {
      clearInterval(intervalId);
    };
  }, [configApi]);

  if (clocks.length !== 0) {
    return (
      <>
        {clocks.map(clock => (
          <HeaderLabel
            label={clock.label}
            value={clock.time}
            key={clock.label}
          />
        ))}
      </>
    );
  }
  return null;
};
