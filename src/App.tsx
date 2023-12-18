import * as _ from 'lodash'
import { IconButton, ChakraProvider, Text, HStack, Input, VStack, Button, Table, TableContainer, Thead, Th, Tr, Tbody, Td, Tfoot } from '@chakra-ui/react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
} from '@chakra-ui/react'
import {AddIcon, DeleteIcon, RepeatIcon} from '@chakra-ui/icons'
import React, { useState, KeyboardEvent } from 'react'
import './App.css';

const defaultMap = new Map([
  ["w", "Neutrophil"],
  ["a", "Lymphocyte"],
  ["s", "Eosinophil"],
  ["d", "Monocyte"]
])

function App() : JSX.Element {
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [maxCount, setMaxCount] = useState<number | undefined>(undefined);
  const [dict, setDict] = useState<Map<string, string> >(new Map(defaultMap.entries()));
  const [keyStrokes, setKeystrokes] = useState<Array<string> >([]);

  function record() {
    if (isRecording) {
      setIsRecording(false)
    } else {
      setIsRecording(true)
    }
  }
  function reset() {
    setKeystrokes([]);
  }
  function keyPress(event:KeyboardEvent<HTMLImageElement> ) {
    if (!isRecording) {
      return;
    }
    if (event.key === "Backspace") {
      keyStrokes.pop();
    } else {
      keyStrokes.push(event.key)
    }
    setKeystrokes(Array.from(keyStrokes))
  }

  return (
    <ChakraProvider>
      <div className="container" tabIndex={0} onKeyDown={keyPress}>
        <VStack>
          {ResultsView(keyStrokes, isRecording, setIsRecording, dict, setDict, maxCount)}
          <HStack>
            <Button
              h="1.75rem"
              size="sm"
              backgroundColor={isRecording ? "red" : "green"}
              colorScheme={'facebook'}
              borderRadius={100}
              onClick={record}
            >{isRecording ? "Pause" : "Start"}</Button>
            <IconButton
              h="1.75rem"
              size="sm"
              backgroundColor={"blue"}
              colorScheme={'facebook'}
              borderRadius={100}
              onClick={reset}
              aria-label='Reset'
              icon={<RepeatIcon/>}
            />
          </HStack>
          <HStack>
            <Text>Max Count (Optional)</Text>
            <Input
                value = {maxCount === undefined ? "" : maxCount}
                isDisabled={isRecording}
                onChange={(e) => {
                  const val = Number(e.target.value)
                  if (isNaN(val) || val === 0) {
                    console.log("here");
                    setMaxCount(undefined);
                  } else {
                    setMaxCount(val);
                  }
                }}
            />
          </HStack>
        </VStack>
      </div>
    </ChakraProvider>
  );
}


function ResultsView(
  keyStrokes: Array<string>,
  isRecording: boolean,
  setIsRecording: React.Dispatch<React.SetStateAction<boolean>>,
  dict: Map<string, string>,
  setDict: React.Dispatch<React.SetStateAction<Map<string, string>>>,
  maxCount: number | undefined,
  ) : JSX.Element {
  const [newKeyStroke, setNewKeyStroke] = useState<string>("");
  const [newFullName, setNewFullName] = useState<string>("");
 
  function deleteKey(e: any) {
    dict.delete(e.target.value)
    setDict(new Map(dict.entries()))
  }

  function addKey() {
    if (newKeyStroke.length !== 1) {
      return
    }
    dict.set(newKeyStroke, newFullName);
    setDict(new Map(dict.entries()));
    setNewKeyStroke("");
    setNewFullName("");
  }

  
  const map = new Map(Object.entries(_.countBy(keyStrokes)));
  const displayArray : Array<[string, string, number]> = Array.from(dict).map(([key, fullName]) =>
    [key, fullName, map.get(key) || 0]
    );

  var total = 0;
  for (let val of displayArray) {
    total += val[2];
  }
  return (
    <>
      <Modal isOpen={isRecording && maxCount !== undefined && total >= maxCount} onClose={() => setIsRecording(false)}>
        <audio
          autoPlay
          src="Cow-moo-sound.mp3"/>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Max Count Reached</ModalHeader>
          <ModalCloseButton />
        </ModalContent>
      </Modal>
      <TableContainer>
        <Table variant='simple'>
          <Thead>
            <Tr>
            <Th></Th>
            <Th>Keystroke</Th>
            <Th>Cell Type</Th>
            <Th>Count</Th>
            <Th>Percentage</Th>
            </Tr>
          </Thead>
          <Tbody>
            {displayArray.map(([key, fullName, val]) =>
              (<Tr>
                <Td>
                  <IconButton
                    h="1.75rem"
                    value={key}
                    size="sm"
                    color="red"
                    borderRadius={100}
                    onClick={deleteKey}
                    aria-label='Delete'
                    icon={<DeleteIcon />}
                  />
                </Td>

                <Td>{key}</Td>
                <Td>{fullName}</Td>
                <Td>{val}</Td>
                <Td>{total > 0 ? (val / total * 100).toFixed(2) : 0}</Td>
              </Tr>)
            )}
            <Tr>
              <Th>
                  <IconButton
                    h="1.75rem"
                    size="sm"
                    backgroundColor="green"
                    colorScheme={'facebook'}
                    borderRadius={100}
                    onClick={addKey}
                    isDisabled={isRecording}
                    icon={<AddIcon />}
                    aria-label='Add'
                  />
              </Th>
              <Th>
                <Input
                  value = {newKeyStroke}
                  placeholder='Key'
                  isDisabled={isRecording}
                  onChange={(e) => {
                    var key = e.target.value
                    if (key.length > 1) {key = key[key.length-1];}
                    setNewKeyStroke(key);
                  }}/>
              </Th>
              <Th>
                <Input
                  value = {newFullName}
                  placeholder='Full Name'
                  isDisabled={isRecording}
                  onChange={(e) => setNewFullName(e.target.value)}
                  onKeyDown={(e) => {
                    if (!isRecording && e.key === "Enter") {
                      addKey()
                    }
                  }}
                  />
              </Th>
            </Tr>
          </Tbody>
          <Tfoot>
            <Tr>
              <Th></Th>
              <Th></Th>
              <Th fontSize={24}>Total</Th>
              <Th fontSize={24}>{total}</Th>
              <Th fontSize={24}>100</Th>
            </Tr>
          </Tfoot>
      </Table>
    </TableContainer>
  </>
  )

}
export default App;
