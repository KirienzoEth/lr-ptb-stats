'use client';
import { Container } from '@chakra-ui/react';
import { ResponsiveLine, Serie } from '@nivo/line';

export default function LineGraph({ data }: { data: Serie[] }) {
  return (
    <ResponsiveLine
      data={data}
      margin={{ top: 50, right: 50, bottom: 50, left: 50 }}
      xScale={{ type: 'linear', min: 'auto', max: 'auto' }}
      yScale={{
        type: 'linear',
        min: 'auto',
        max: 'auto',
        stacked: false,
        reverse: false,
      }}
      yFormat=" >-$,.2f"
      curve="cardinal"
      axisTop={null}
      axisRight={null}
      axisBottom={{
        renderTick() {
          return <></>;
        },
        tickSize: 0,
        tickPadding: 5,
        tickRotation: 0,
        legendOffset: 36,
        legendPosition: 'middle',
      }}
      axisLeft={{
        tickSize: 0,
        tickPadding: 5,
        tickRotation: 0,
        legendOffset: -40,
        legendPosition: 'middle',
      }}
      enableGridX={false}
      colors={{ scheme: 'dark2' }}
      enablePoints={false}
      pointSize={10}
      pointColor={{ theme: 'background' }}
      pointBorderWidth={2}
      pointBorderColor={{ from: 'serieColor' }}
      pointLabelYOffset={-12}
      useMesh={true}
      legends={[
        {
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
      tooltip={({ point }) => {
        const date = new Date(+point.data.x.toString() * 1000);
        return (
          <Container
            backgroundColor="var(--chakra-colors-chakra-body-text)"
            border="1px solid black"
            borderRadius="10px"
            color="black"
            padding="0 5px"
            textAlign="center"
          >
            <Container color={point.serieColor}>{point.serieId}</Container>
            {`${date.getUTCFullYear()}-${(date.getUTCMonth() + 1)
              .toString()
              .padStart(2, '0')}-${date
              .getUTCDate()
              .toString()
              .padStart(2, '0')}`}
            : <b>{point.data.yFormatted}</b>
          </Container>
        );
      }}
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
