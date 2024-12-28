import {
  Button,
  Container,
  Text,
  Title,
  Modal,
  TextInput,
  Group,
  Card,
  ActionIcon,
} from "@mantine/core";

import { useState, useRef, useEffect } from "react";
import { MoonStars, Sun, Trash } from "tabler-icons-react";

import { MantineProvider, ColorSchemeProvider } from "@mantine/core";
import { useHotkeys, useLocalStorage } from "@mantine/hooks";

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [opened, setOpened] = useState(false);
  const taskState = useRef("Not Done");
  const taskTitle = useRef("");
  const taskSummary = useRef("");
  const taskDeadline = useRef(new Date("2024-12-25"));

  const [colorScheme, setColorScheme] = useLocalStorage({
    key: "mantine-color-scheme",
    defaultValue: "light",
    getInitialValueInEffect: true,
  });
  const toggleColorScheme = (value) =>
    setColorScheme(value || (colorScheme === "dark" ? "light" : "dark"));

  useHotkeys([["mod+J", () => toggleColorScheme()]]);

 
  function loadTasks() {
    try {
      const loadedTasks = JSON.parse(localStorage.getItem("tasks")) || [];
      setTasks(loadedTasks);
    } catch (error) {
      console.error("Failed to load tasks:", error);
      setTasks([]); 
    }
  }

  function saveTasks(tasksToSave) {
    localStorage.setItem("tasks", JSON.stringify(tasksToSave));
  }

  function createTask() {
    const newTask = {
      title: taskTitle.current.value,
      summary: taskSummary.current.value,
      state: taskState.current,
      deadline: taskDeadline.current
    };

    const updatedTasks = [...tasks, newTask];
    setTasks(updatedTasks); 
    saveTasks(updatedTasks); 
    taskState.current="Not Done"

  }

  function deleteTask(index) {
    const updatedTasks = tasks.filter((_, i) => i !== index); 
    setTasks(updatedTasks);
    saveTasks(updatedTasks); 
  }

  function sortTasks(criteria) {
    const sortedTasks = [...tasks].sort((a, b) => {
      if (criteria === "deadline") {
        return new Date(a.deadline) - new Date(b.deadline);
      }
      return a.state === criteria ? -1 : 1;
    });
    setTasks(sortedTasks);
  }

  function filterTasks(criteria) {
    if (!criteria) {
      loadTasks(); 
    } else {
      const filteredTasks = tasks.filter((task) => task.state === criteria);
      setTasks(filteredTasks);
    }
  }

  function sortTasksByDeadline() {
    const sortedTasks = [...tasks].sort((a, b) => {
      if (!a.deadline) return 1; // Move tasks without deadlines to the end
      if (!b.deadline) return -1;
      return new Date(a.deadline) - new Date(b.deadline);
    });
    setTasks(sortedTasks);
  }

  useEffect(() => {
    loadTasks();
  }, []);

  return (
    <ColorSchemeProvider
      colorScheme={colorScheme}
      toggleColorScheme={toggleColorScheme}
    >
      <MantineProvider
        theme={{ colorScheme, defaultRadius: "md" }}
        withGlobalStyles
        withNormalizeCSS
      >
        <div className="App">
          <Modal
            opened={opened}
            size={"md"}
            title={"New Task"}
            withCloseButton={false}
            onClose={() => setOpened(false)}
            centered
          >
            <TextInput
              mt={"md"}
              ref={taskTitle}
              placeholder={"Task Title"}
              required
              label={"Title"}
            />
            <TextInput
              ref={taskSummary}
              mt={"md"}
              placeholder={"Task Summary"}
              label={"Summary"}
            />
            <select
              onChange={(e) => (taskState.current = e.target.value)}
              defaultValue="Not Done"
            >
              <option value="Done">Done</option>
              <option value="Not Done">Not Done</option>
              <option value="Doing right now">Doing right now</option>
            </select>
            <input
              type="date"
              label="Deadline"
              placeholder="Pick a deadline"
              defaultValue="2024-12-25" 
              onChange={(e) => (taskDeadline.current = e.target.value)}
            />
            <Group mt={"md"} position={"apart"}>
              <Button onClick={() => setOpened(false)} variant={"subtle"}>
                Cancel
              </Button>
              <Button onClick={createTask}>Create Task</Button>
            </Group>
          </Modal>
          <Container size={550} my={40}>
            <Group position={"apart"}>
              <Title
                sx={(theme) => ({
                  fontFamily: `Greycliff CF, ${theme.fontFamily}`,
                  fontWeight: 900,
                })}
              >
                My Tasks
              </Title>
              <ActionIcon
                color={"blue"}
                onClick={() => toggleColorScheme()}
                size="lg"
              >
                {colorScheme === "dark" ? (
                  <Sun size={16} />
                ) : (
                  <MoonStars size={16} />
                )}
              </ActionIcon>
            </Group>
            <Group mt="md">
              <Button onClick={() => sortTasks("Done")}>Show 'Done' First</Button>
              <Button onClick={() => sortTasks("Doing right now")}>
                Show 'Doing' First
              </Button>
              <Button onClick={() => sortTasks("Not Done")}>
                Show 'Not Done' First
              </Button>
              
            </Group>
            <Group mt="md">
              <Button onClick={() => filterTasks("Done")}>Filter 'Done'</Button>
              <Button onClick={() => filterTasks("Doing right now")}>
                Filter 'Doing'
              </Button>
              <Button onClick={() =>{ filterTasks("Not Done")}}>
                Filter 'Not Done'
              </Button>
              <Button onClick={() => filterTasks(null)}>Clear Filters</Button>
              <Button onClick={sortTasksByDeadline}>Sort by Deadline</Button>;
            </Group>
            {tasks.length > 0 ? (
              tasks.map((task, index) => (
                <Card withBorder key={index} mt={"sm"}>
                  <Group position={"apart"}>
                    <Text weight={"bold"}>{task.title}</Text>
                    <ActionIcon
                      onClick={() => deleteTask(index)}
                      color={"red"}
                      variant={"transparent"}
                    >
                      <Trash />
                    </ActionIcon>
                   
                  </Group>
                  <Text color={"dimmed"} size={"md"} mt={"sm"}>
                    {task.summary || "No summary provided"}
                  </Text>
                  <Text color={"dimmed"} size={"sm"}>
                    State: {task.state}
                  </Text>
                  <Text color={"dimmed"} size={"md"} mt={"sm"}>
                   Deadline: {task.deadline}
                  </Text>
                </Card>
              ))
            ) : (
              <Text size={"lg"} mt={"md"} color={"dimmed"}>
                You have no tasks
              </Text>
            )}
            <Button onClick={() => setOpened(true)} fullWidth mt={"md"}>
              New Task
            </Button>
          </Container>
        </div>
      </MantineProvider>
    </ColorSchemeProvider>
  );
}
