import React, { useEffect, useRef, useState } from 'react';
import Editor from '@monaco-editor/react';
import { Box } from '@mui/material';
import taskApi from '../../../api/taskApi';

const CodeEditor = (props) => {
  const boardId = props.boardId;
  const [content, setContent] = useState('');
  const [task, setTask] = useState(props.task);
  const editorRef = useRef();

  let timer;
  const timeout = 500;
  let isModalClosed = false;



  const updateContent = (value) => {
    clearTimeout(timer);
    const data = value;

    if (!isModalClosed) {
      timer = setTimeout(async () => {
        try {
          await taskApi.update(boardId, task.id, { content: data });
        } catch (err) {
          alert(err);
        }
      }, timeout);

      task.content = data;
      setContent(data);
      props.onUpdate(task);
    }
  };
  

  return (
    <>
      <Editor
        height="80vh"
        defaultLanguage="javascript"
        value={content}
        onChange={updateContent}
        options={{
         theme: 'vs-dark',
          automaticLayout: true,
          minimap: {
            enabled: false,
          },
          fontSize: 14,
          scrollBeyondLastLine: false,
          wordWrap: 'on',
          wrappingIndent: 'same',
          folding: false,
          lineNumbers: 'on',
          renderLineHighlight: 'all',
          renderIndentGuides: true,
          selectionHighlight: true,
          readOnly: false,
          fontFamily: 'Consolas, Menlo, "Courier New", monospace',
          
        }}
        onMount={(editor) => {
          editorRef.current = editor;
        }}
      />
    </>
  );
};

export default CodeEditor;
