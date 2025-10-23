import React, { useState } from "react";
import { Calendar, Badge, Modal, Button } from "antd";
import type { BadgeProps, CalendarProps } from "antd";
import type { Dayjs } from "dayjs";

// Dummy data for events
const getListData = (value: Dayjs) => {
  let listData: { type: string; content: string; date: Dayjs }[] = [];
  switch (value.date()) {
    case 8:
      listData = [
        { type: "warning", content: "This is a warning event.", date: value },
        { type: "success", content: "This is a usual event.", date: value },
      ];
      break;
    case 10:
      listData = [
        { type: "warning", content: "This is a warning event.", date: value },
        { type: "success", content: "This is a usual event.", date: value },
        { type: "error", content: "This is an error event.", date: value },
      ];
      break;
    case 15:
      listData = [
        { type: "warning", content: "This is a warning event.", date: value },
        {
          type: "success",
          content: "This is a very long usual event......",
          date: value,
        },
        { type: "error", content: "This is error event 1.", date: value },
        { type: "error", content: "This is error event 2.", date: value },
      ];
      break;
    default:
  }
  return listData || [];
};

const getMonthData = (value: Dayjs) => {
  if (value.month() === 8) {
    return 1394;
  }
  return null;
};

const FullCalendarBase: React.FC = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);
  const [events, setEvents] = useState<{ type: string; content: string }[]>([]);

  const monthCellRender = (value: Dayjs) => {
    const num = getMonthData(value);
    return num ? (
      <div className="notes-month">
        <section>{num}</section>
        <span>Backlog number</span>
      </div>
    ) : null;
  };

  const dateCellRender = (value: Dayjs) => {
    const listData = getListData(value);
    return (
      <ul className="events">
        {listData.map((item) => (
          <li key={item.content}>
            <Badge
              status={item.type as BadgeProps["status"]}
              text={item.content}
            />
          </li>
        ))}
      </ul>
    );
  };

  const cellRender: CalendarProps<Dayjs>["cellRender"] = (current, info) => {
    if (info.type === "date") return dateCellRender(current);
    if (info.type === "month") return monthCellRender(current);
    return info.originNode;
  };

  const handleDateSelect = (date: Dayjs) => {
    const listData = getListData(date);
    setEvents(listData);
    setSelectedDate(date);
    setModalVisible(true);
  };

  const handleModalClose = () => {
    setModalVisible(false);
  };

  const handleEventClick = (event: { type: string; content: string }) => {
    Modal.info({
      title: event.content,
      content: (
        <div>
          <p>Event Type: {event.type}</p>
          <p>Date: {selectedDate?.format("YYYY-MM-DD")}</p>
        </div>
      ),
      onOk() {},
    });
  };

  return (
    <>
      <Calendar cellRender={cellRender} onSelect={handleDateSelect} />
      <Modal
        title={`Events on ${selectedDate?.format("YYYY-MM-DD")}`}
        visible={modalVisible}
        onCancel={handleModalClose}
        footer={[
          <Button key="back" onClick={handleModalClose}>
            Close
          </Button>,
        ]}
      >
        <ul>
          {events.map((event) => (
            <li key={event.content} onClick={() => handleEventClick(event)}>
              <Badge
                status={event.type as BadgeProps["status"]}
                text={event.content}
              />
            </li>
          ))}
        </ul>
      </Modal>
    </>
  );
};

export default FullCalendarBase;
