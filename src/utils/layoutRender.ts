export type Rect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type SeatCell = Rect & {
  seats: number;
};

type SeatGridOptions = {
  seatCount: number;
  area: Rect;
  maxRows?: number;
  maxCols?: number;
  gap?: number;
  seatsPerCell?: number;
};

export const buildSeatGrid = ({
  seatCount,
  area,
  maxRows = 6,
  maxCols = 8,
  gap = 8,
  seatsPerCell = 8
}: SeatGridOptions): SeatCell[] => {
  const totalCells = Math.max(1, Math.ceil(seatCount / seatsPerCell));
  const rows = Math.min(maxRows, Math.ceil(Math.sqrt(totalCells)));
  const cols = Math.min(maxCols, Math.ceil(totalCells / rows));

  const cellWidth = (area.width - gap * (cols - 1)) / cols;
  const cellHeight = (area.height - gap * (rows - 1)) / rows;

  const cells: SeatCell[] = [];
  let remainingSeats = seatCount;

  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      if (remainingSeats <= 0) {
        break;
      }

      const seats = Math.min(seatsPerCell, remainingSeats);
      remainingSeats -= seats;

      cells.push({
        x: area.x + col * (cellWidth + gap),
        y: area.y + row * (cellHeight + gap),
        width: cellWidth,
        height: cellHeight,
        seats
      });
    }
  }

  return cells;
};
