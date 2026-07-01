import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import { fetchEvents, searchEvents, filterByCategory } from './src/api/eventService';

export default function App() {

  useEffect(() => {
    const test = async () => {
      try {
        // Test 1 — fetch all events
        const events = await fetchEvents();
        console.log('fetchEvents:', events);

        // Test 2 — search
        const searched = await searchEvents('music');
        console.log('searchEvents:', searched);

        // Test 3 — filter by category
        const filtered = await filterByCategory('Technology');
        console.log('filterByCategory:', filtered);

      } catch (err) {
        console.log('Error:', err.message);
      }
    };

    test();
  }, []);

  return (
    <View>
      <Text>Check your console/Metro logs</Text>
    </View>
  );
}