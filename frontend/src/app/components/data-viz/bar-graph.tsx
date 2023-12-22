'use client';
import { Container, Flex } from '@chakra-ui/react';
import { BarDatum, ResponsiveBar } from '@nivo/bar';

/**
 * @param data of the series as detailed here: https://nivo.rocks/bar/
 * @param keys Name of the keys for each section of a bar
 * @param index Name of the index (X axis) for each data point
 */
export default function BarGraph({
  data,
  keys,
  index,
}: {
  data: BarDatum[];
  keys: string[];
  index: string;
}) {
  return (
    <ResponsiveBar
      data={data}
      keys={keys}
      indexBy={index}
      valueFormat=" >-$,.2f"
      enableLabel={false}
      margin={{ top: 50, right: 50, bottom: 50, left: 50 }}
      padding={0.3}
      valueScale={{ type: 'linear' }}
      indexScale={{ type: 'band', round: true }}
      colors={{ scheme: 'dark2' }}
      borderColor={{
        from: 'color',
        modifiers: [['darker', 1.6]],
      }}
      axisTop={null}
      axisRight={null}
      labelSkipWidth={12}
      labelSkipHeight={12}
      labelTextColor={{
        from: 'color',
        modifiers: [['darker', 3]],
      }}
      axisBottom={{
        tickSize: 0,
        renderTick() {
          return <></>;
        },
      }}
      axisLeft={{
        tickSize: 0,
      }}
      legends={[
        {
          dataFrom: 'keys',
          anchor: 'top',
          direction: 'row',
          justify: false,
          translateX: 0,
          translateY: -30,
          itemsSpacing: 0,
          itemDirection: 'left-to-right',
          itemWidth: 100,
          itemHeight: 20,
          itemOpacity: 0.75,
          symbolSize: 16,
          itemTextColor: 'white',
          symbolShape: 'circle',
          symbolBorderColor: 'rgba(0, 0, 0, .5)',
          effects: [
            {
              on: 'hover',
              style: {
                itemBackground: 'rgba(0, 0, 0, .03)',
                itemOpacity: 1,
              },
            },
          ],
        },
      ]}
      tooltip={(point) => {
        return (
          <Container
            backgroundColor="var(--chakra-colors-chakra-body-text)"
            border="1px solid black"
            borderRadius="10px"
            color="black"
            padding="0 5px"
            textAlign="center"
          >
            <Container color={point.color}>{point.id}</Container>
            <Container>
              {point.indexValue}: <b>{point.formattedValue}</b>
            </Container>
          </Container>
        );
      }}
      role="application"
      theme={{
        tooltip: {
          basic: { color: 'black' },
        },
        axis: {
          ticks: {
            text: {
              fill: 'var(--chakra-colors-chakra-body-text)',
            },
          },
          legend: {
            text: {
              fill: 'var(--chakra-colors-chakra-body-text)',
            },
          },
        },
      }}
    />
  );
}
