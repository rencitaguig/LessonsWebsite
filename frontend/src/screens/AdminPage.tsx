// src/screens/AdminPage.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, Platform, Image } from 'react-native';
import { API_URL } from '../constants/api';
import RichContentEditor from '../components/RichContentEditor';

type ImagePosition = 'top' | 'bottom' | 'left' | 'right';

interface TopicOption {
  id: number;
  parent_topic_id: number | null;
  title: string;
  slug: string;
  content: string;
  title_text_size: number;
  content_text_size: number;
  image_url: string | null;
  image_position: ImagePosition;
  images: TopicImage[];
  quiz_id: number | null;
  quiz_title: string | null;
  youtube_url: string | null;
}

interface TopicImage {
  id: number;
  image_url: string;
  image_position: ImagePosition;
  image_width: number;
  sort_order: number;
}

interface NewTopicImage {
  file: File;
  preview: string;
  position: ImagePosition;
  width: number;
}

interface QuizOptionDraft {
  text: string;
  isCorrect: boolean;
}

interface QuizQuestionDraft {
  questionText: string;
  points: number;
  options: QuizOptionDraft[];
}

export default function AdminPage({ adminId = 1 }: { adminId?: number }) {
  const [topics, setTopics] = useState<TopicOption[]>([]);
  const [parentTopicId, setParentTopicId] = useState<number | null>(null);
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [content, setContent] = useState('');
  const [titleTextSize, setTitleTextSize] = useState(24);
  const [contentTextSize, setContentTextSize] = useState(16);
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [editingTopicId, setEditingTopicId] = useState<number | null>(null);
  const [newImages, setNewImages] = useState<NewTopicImage[]>([]);
  const [existingImages, setExistingImages] = useState<TopicImage[]>([]);
  const [removedImageIds, setRemovedImageIds] = useState<number[]>([]);
  const [quizTopicId, setQuizTopicId] = useState<number | null>(null);
  const [quizTitle, setQuizTitle] = useState('');
  const [passingScore, setPassingScore] = useState(60);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestionDraft[]>([
    { questionText: '', points: 1, options: [{ text: '', isCorrect: true }, { text: '', isCorrect: false }] }
  ]);

  const loadTopics = async () => {
    const res = await fetch(`${API_URL}/topics`);
    if (!res.ok) {
      throw new Error('Unable to load topics');
    }
    const data: TopicOption[] = await res.json();
    setTopics(data);
  };

  useEffect(() => {
    loadTopics().catch((err) => console.error(err));
  }, []);

  const resetForm = () => {
    setTitle('');
    setSlug('');
    setContent('');
    setTitleTextSize(24);
    setContentTextSize(16);
    setYoutubeUrl('');
    setParentTopicId(null);
    setEditingTopicId(null);
    setNewImages([]);
    setExistingImages([]);
    setRemovedImageIds([]);
  };

  const handleSaveTopic = async () => {
    if (!title || !slug || !content) {
      alert('Please fill out all fields.');
      return;
    }
    try {
      const isEditing = editingTopicId !== null;
      const formData = new FormData();
      formData.append('authorId', String(adminId));
      formData.append('parentTopicId', parentTopicId === null ? '' : String(parentTopicId));
      formData.append('title', title);
      formData.append('slug', slug);
      formData.append('content', content);
      formData.append('titleTextSize', String(titleTextSize));
      formData.append('contentTextSize', String(contentTextSize));
      formData.append('youtubeUrl', youtubeUrl.trim());
      formData.append('imagePositions', JSON.stringify(newImages.map((image) => ({ position: image.position, width: image.width }))));
      formData.append('removeImageIds', JSON.stringify(removedImageIds));
      formData.append('imageUpdates', JSON.stringify(existingImages.map((image) => ({ id: image.id, position: image.image_position, width: image.image_width }))));
      newImages.forEach((image) => formData.append('images', image.file));
      const res = await fetch(`${API_URL}/topics${isEditing ? `/${editingTopicId}` : ''}`, {
        method: isEditing ? 'PUT' : 'POST',
        body: formData
      });
      if (res.ok) {
        alert(`Topic ${isEditing ? 'updated' : 'created'} successfully!`);
        resetForm();
        await loadTopics();
      } else {
        const error = await res.json();
        alert(error.error || 'Error creating topic');
      }
    } catch (err) {
      console.error(err);
      alert('Error creating topic');
    }
  };

  const editTopic = (topic: TopicOption) => {
    setEditingTopicId(topic.id);
    setTitle(topic.title);
    setSlug(topic.slug);
    setContent(topic.content);
    setTitleTextSize(topic.title_text_size || 24);
    setContentTextSize(topic.content_text_size || 16);
    setYoutubeUrl(topic.youtube_url || '');
    setParentTopicId(topic.parent_topic_id);
    setNewImages([]);
    setExistingImages(topic.images || []);
    setRemovedImageIds([]);
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setNewImages((current) => [
      ...current,
      ...files.map((file) => ({ file, preview: URL.createObjectURL(file), position: 'top' as ImagePosition, width: 100 }))
    ]);
  };

  const getYouTubeId = (url: string) => {
    const match = url.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([\w-]{11})/);
    return match?.[1] || null;
  };

  const updateExistingImagePosition = (imageId: number, position: ImagePosition) => {
    setExistingImages((images) => images.map((image) => image.id === imageId ? { ...image, image_position: position } : image));
  };

  const removeExistingImage = (imageId: number) => {
    setExistingImages((images) => images.filter((image) => image.id !== imageId));
    setRemovedImageIds((ids) => [...ids, imageId]);
  };

  const updateNewImagePosition = (index: number, position: ImagePosition) => {
    setNewImages((images) => images.map((image, imageIndex) => imageIndex === index ? { ...image, position } : image));
  };

  const updateExistingImageWidth = (imageId: number, width: number) => {
    setExistingImages((images) => images.map((image) => image.id === imageId ? { ...image, image_width: width } : image));
  };

  const updateNewImageWidth = (index: number, width: number) => {
    setNewImages((images) => images.map((image, imageIndex) => imageIndex === index ? { ...image, width } : image));
  };

  const addQuizQuestion = () => {
    setQuizQuestions((questions) => [...questions, { questionText: '', points: 1, options: [{ text: '', isCorrect: true }, { text: '', isCorrect: false }] }]);
  };

  const updateQuizQuestion = (questionIndex: number, changes: Partial<QuizQuestionDraft>) => {
    setQuizQuestions((questions) => questions.map((question, index) => index === questionIndex ? { ...question, ...changes } : question));
  };

  const updateQuizOption = (questionIndex: number, optionIndex: number, text: string) => {
    setQuizQuestions((questions) => questions.map((question, index) => index === questionIndex
      ? { ...question, options: question.options.map((option, currentIndex) => currentIndex === optionIndex ? { ...option, text } : option) }
      : question));
  };

  const setCorrectOption = (questionIndex: number, optionIndex: number) => {
    setQuizQuestions((questions) => questions.map((question, index) => index === questionIndex
      ? { ...question, options: question.options.map((option, currentIndex) => ({ ...option, isCorrect: currentIndex === optionIndex })) }
      : question));
  };

  const addQuizOption = (questionIndex: number) => {
    setQuizQuestions((questions) => questions.map((question, index) => index === questionIndex
      ? { ...question, options: [...question.options, { text: '', isCorrect: false }] }
      : question));
  };

  const removeQuizOption = (questionIndex: number, optionIndex: number) => {
    setQuizQuestions((questions) => questions.map((question, index) => {
      if (index !== questionIndex) return question;
      if (question.options.length <= 2) {
        alert('Each question must have at least 2 options.');
        return question;
      }
      const wasCorrect = question.options[optionIndex]?.isCorrect;
      const newOptions = question.options.filter((_, optIdx) => optIdx !== optionIndex);
      if (wasCorrect && newOptions.length > 0) {
        newOptions[0] = { ...newOptions[0], isCorrect: true };
      }
      return { ...question, options: newOptions };
    }));
  };

  const removeQuizQuestion = (questionIndex: number) => {
    if (quizQuestions.length <= 1) {
      alert('A quiz must have at least 1 question.');
      return;
    }
    setQuizQuestions((questions) => questions.filter((_, index) => index !== questionIndex));
  };

  const saveQuiz = async () => {
    if (!quizTopicId || !quizTitle.trim()) {
      alert('Choose a topic and enter a quiz title.');
      return;
    }
    if (quizQuestions.some((question) => !question.questionText.trim() || question.options.length < 2 || question.options.some((option) => !option.text.trim()) || question.options.filter((option) => option.isCorrect).length !== 1)) {
      alert('Complete every question, option, and correct answer before saving.');
      return;
    }
    try {
      const res = await fetch(`${API_URL}/quizzes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topicId: quizTopicId, title: quizTitle, passingScore, questions: quizQuestions })
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Unable to save quiz');
        return;
      }
      alert('Quiz saved successfully.');
      setQuizTitle('');
      setPassingScore(60);
      setQuizTopicId(null);
      setQuizQuestions([{ questionText: '', points: 1, options: [{ text: '', isCorrect: true }, { text: '', isCorrect: false }] }]);
      await loadTopics();
    } catch (err) {
      console.error(err);
      alert('Unable to save quiz');
    }
  };

  const editQuiz = async (topic: TopicOption) => {
    if (!topic.quiz_id) return;

    try {
      const res = await fetch(`${API_URL}/quizzes/${topic.quiz_id}`);
      const quiz = await res.json();
      if (!res.ok) {
        alert(quiz.error || 'Unable to load quiz');
        return;
      }

      setQuizTopicId(topic.id);
      setQuizTitle(quiz.title);
      setPassingScore(Number(quiz.passing_score));
      setQuizQuestions(quiz.questions.map((question: { question_text: string; points: number; options: { option_text: string; is_correct: boolean | number }[] }) => ({
        questionText: question.question_text,
        points: question.points,
        options: question.options.map((option) => ({
          text: option.option_text,
          isCorrect: Boolean(option.is_correct)
        }))
      })));
    } catch (err) {
      console.error(err);
      alert('Unable to load quiz');
    }
  };

  const removeQuiz = async (quizId: number) => {
    try {
      const res = await fetch(`${API_URL}/quizzes/${quizId}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Unable to remove quiz');
        return;
      }
      await loadTopics();
    } catch (err) {
      console.error(err);
      alert('Unable to remove quiz');
    }
  };

  const confirmRemoveQuiz = (topic: TopicOption) => {
    const message = `Remove the quiz from "${topic.title}"? Its questions, answers, and saved attempts will be deleted.`;
    if (Platform.OS === 'web') {
      if (window.confirm(message) && topic.quiz_id) void removeQuiz(topic.quiz_id);
      return;
    }
    Alert.alert('Remove quiz', message, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => topic.quiz_id && void removeQuiz(topic.quiz_id) }
    ]);
  };

  const deleteTopic = async (topicId: number) => {
    try {
      const res = await fetch(`${API_URL}/topics/${topicId}`, { method: 'DELETE' });
      if (!res.ok) {
        const error = await res.json();
        alert(error.error || 'Error deleting topic');
        return;
      }
      await loadTopics();
    } catch (err) {
      console.error(err);
      alert('Error deleting topic');
    }
  };

  const confirmDeleteTopic = (topic: TopicOption) => {
    const message = `Delete "${topic.title}"? Any subtopics will become top-level topics.`;

    if (Platform.OS === 'web') {
      if (window.confirm(message)) {
        void deleteTopic(topic.id);
      }
      return;
    }

    Alert.alert(
      'Delete topic',
      message,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => void deleteTopic(topic.id) }
      ]
    );
  };

  const renderPositionPicker = (position: ImagePosition, onChange: (nextPosition: ImagePosition) => void) => (
    <View style={styles.imagePositionOptions}>
      {(['top', 'bottom', 'left', 'right'] as ImagePosition[]).map((option) => (
        <TouchableOpacity
          key={option}
          style={[styles.imagePositionOption, position === option && styles.imagePositionOptionSelected]}
          onPress={() => onChange(option)}
        >
          <Text style={styles.imagePositionText}>{option[0].toUpperCase() + option.slice(1)}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>{editingTopicId === null ? 'Create New Lesson Topic' : `Edit Lesson Topic (ID: ${editingTopicId})`}</Text>
      <TextInput 
        placeholder="Topic Title" 
        style={styles.input} 
        value={title} 
        onChangeText={setTitle} 
      />
      <TextInput 
        placeholder="Slug (e.g. intro-to-javascript)" 
        style={styles.input} 
        value={slug} 
        onChangeText={setSlug} 
      />
      <Text style={styles.label}>Parent Topic (optional)</Text>
      <View style={styles.parentOptions}>
        <TouchableOpacity
          style={[styles.parentOption, parentTopicId === null && styles.parentOptionSelected]}
          onPress={() => setParentTopicId(null)}
        >
          <Text style={styles.parentOptionText}>Top-level topic</Text>
        </TouchableOpacity>
        {topics.filter((topic) => topic.parent_topic_id === null).map((topic) => (
          <TouchableOpacity
            key={topic.id}
            style={[styles.parentOption, parentTopicId === topic.id && styles.parentOptionSelected]}
            onPress={() => setParentTopicId(topic.id)}
          >
            <Text style={styles.parentOptionText}>{topic.title} (ID: {topic.id})</Text>
          </TouchableOpacity>
        ))}
      </View>
      <Text style={styles.label}>Lesson Content</Text>
      <RichContentEditor value={content} onChange={setContent} />
      <Text style={styles.label}>YouTube Video (optional)</Text>
      <TextInput
        placeholder="Paste a YouTube link"
        style={styles.input}
        value={youtubeUrl}
        onChangeText={setYoutubeUrl}
        autoCapitalize="none"
      />
      {getYouTubeId(youtubeUrl) && (
        <Image
          source={{ uri: `https://img.youtube.com/vi/${getYouTubeId(youtubeUrl)}/hqdefault.jpg` }}
          style={styles.youtubePreview}
          resizeMode="contain"
        />
      )}
      <Text style={styles.label}>Title Size: {titleTextSize}px</Text>
      <input type="range" min="16" max="64" step="1" value={titleTextSize} onChange={(event) => setTitleTextSize(Number(event.target.value))} />
      <Text style={[styles.previewTitle, { fontSize: titleTextSize }]}>Title preview: {title || 'Your topic title'}</Text>
      <Text style={styles.label}>Content Size: {contentTextSize}px</Text>
      <input type="range" min="12" max="32" step="1" value={contentTextSize} onChange={(event) => setContentTextSize(Number(event.target.value))} />
      <Text style={[styles.previewContent, { fontSize: contentTextSize }]}>Content</Text>
      {Platform.OS === 'web' && (
        <View style={styles.imagePicker}>
          <Text style={styles.label}>Topic Images (optional, up to 10 images, max 5 MB each)</Text>
          <input type="file" accept="image/*" multiple onChange={handleImageChange} />
        </View>
      )}
      {existingImages.map((image) => (
        <View key={image.id} style={styles.imageEditorRow}>
          <Image source={{ uri: `${API_URL.replace(/\/api$/, '')}${image.image_url}` }} style={styles.imagePreview} resizeMode="contain" />
          <Text style={styles.imageLabel}>Existing Image</Text>
          {renderPositionPicker(image.image_position, (position) => updateExistingImagePosition(image.id, position))}
          <Text style={styles.imageLabel}>Image Size: {image.image_width}%</Text>
          <input type="range" min="25" max="100" step="5" value={image.image_width} onChange={(event) => updateExistingImageWidth(image.id, Number(event.target.value))} />
          <TouchableOpacity style={styles.removeImageButton} onPress={() => removeExistingImage(image.id)}>
            <Text style={styles.removeImageButtonText}>Remove This Image</Text>
          </TouchableOpacity>
        </View>
      ))}
      {newImages.map((image, index) => (
        <View key={image.preview} style={styles.imageEditorRow}>
          <Image source={{ uri: image.preview }} style={styles.imagePreview} resizeMode="contain" />
          <Text style={styles.imageLabel}>New Image</Text>
          {renderPositionPicker(image.position, (position) => updateNewImagePosition(index, position))}
          <Text style={styles.imageLabel}>Image Size: {image.width}%</Text>
          <input type="range" min="25" max="100" step="5" value={image.width} onChange={(event) => updateNewImageWidth(index, Number(event.target.value))} />
          <TouchableOpacity style={styles.removeImageButton} onPress={() => setNewImages((images) => images.filter((_, imageIndex) => imageIndex !== index))}>
            <Text style={styles.removeImageButtonText}>Remove This Image</Text>
          </TouchableOpacity>
        </View>
      ))}
      <TouchableOpacity style={styles.button} onPress={handleSaveTopic}>
        <Text style={styles.buttonText}>{editingTopicId === null ? 'Publish Lesson' : 'Save Changes'}</Text>
      </TouchableOpacity>
      {editingTopicId !== null && (
        <TouchableOpacity style={styles.cancelButton} onPress={resetForm}>
          <Text style={styles.cancelButtonText}>Cancel Edit</Text>
        </TouchableOpacity>
      )}
      <Text style={styles.listHeader}>Created Topics</Text>
      {topics.map((topic) => (
        <View key={topic.id} style={styles.topicRow}>
          <View style={styles.topicDetails}>
            {topic.image_url && <Image source={{ uri: `${API_URL.replace(/\/api$/, '')}${topic.image_url}` }} style={styles.topicThumbnail} />}
            <View style={styles.topicTitleRow}>
              <Text style={[styles.topicTitle, topic.parent_topic_id !== null && styles.subtopicTitle]}>
                {topic.parent_topic_id !== null ? `- ${topic.title}` : topic.title}
              </Text>
              <View style={styles.idBadge}>
                <Text style={styles.idBadgeText}>ID: {topic.id}</Text>
              </View>
            </View>
            <Text style={styles.topicType}>
              {topic.parent_topic_id !== null ? `Subtopic • Parent ID: ${topic.parent_topic_id}` : 'Top-level Topic'}
              {topic.quiz_id ? ` • Quiz ID: ${topic.quiz_id}` : ' • No Quiz'}
            </Text>
          </View>
          <View style={styles.topicActions}>
            <TouchableOpacity style={styles.editButton} onPress={() => editTopic(topic)}>
              <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.deleteButton} onPress={() => confirmDeleteTopic(topic)}>
              <Text style={styles.deleteButtonText}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
      <View style={styles.quizBuilder}>
        <Text style={styles.listHeader}>Quiz Maker</Text>
        <Text style={styles.label}>Attach quiz to topic</Text>
        <View style={styles.parentOptions}>
          {topics.map((topic) => (
            <TouchableOpacity key={topic.id} style={[styles.parentOption, quizTopicId === topic.id && styles.parentOptionSelected]} onPress={() => setQuizTopicId(topic.id)}>
              <Text style={styles.parentOptionText}>
                {topic.parent_topic_id !== null ? `↳ ${topic.title}` : topic.title} (ID: {topic.id})
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <TextInput placeholder="Quiz title" style={styles.input} value={quizTitle} onChangeText={setQuizTitle} />
        <Text style={styles.label}>Passing score: {passingScore}%</Text>
        <input type="range" min="0" max="100" step="5" value={passingScore} onChange={(event) => setPassingScore(Number(event.target.value))} />
        {quizQuestions.map((question, questionIndex) => (
          <View key={questionIndex} style={styles.questionEditor}>
            <View style={styles.questionHeader}>
              <Text style={styles.questionEditorTitle}>Question {questionIndex + 1}</Text>
              {quizQuestions.length > 1 && (
                <TouchableOpacity
                  style={styles.removeQuestionButton}
                  onPress={() => removeQuizQuestion(questionIndex)}
                >
                  <Text style={styles.removeQuestionButtonText}>Remove Question</Text>
                </TouchableOpacity>
              )}
            </View>
            <TextInput placeholder="Question text" style={styles.input} value={question.questionText} onChangeText={(text) => updateQuizQuestion(questionIndex, { questionText: text })} />
            <TextInput placeholder="Points" style={styles.pointsInput} keyboardType="numeric" value={String(question.points)} onChangeText={(value) => updateQuizQuestion(questionIndex, { points: Number(value) || 1 })} />
            {question.options.map((option, optionIndex) => (
              <View key={optionIndex} style={styles.optionEditor}>
                <TouchableOpacity style={[styles.correctSelector, option.isCorrect && styles.correctSelectorActive]} onPress={() => setCorrectOption(questionIndex, optionIndex)}>
                  <Text style={[styles.correctSelectorText, option.isCorrect && styles.correctSelectorTextActive]}>{option.isCorrect ? 'Correct' : 'Set correct'}</Text>
                </TouchableOpacity>
                <TextInput placeholder={`Answer option ${optionIndex + 1}`} style={styles.optionInput} value={option.text} onChangeText={(text) => updateQuizOption(questionIndex, optionIndex, text)} />
                {question.options.length > 2 && (
                  <TouchableOpacity
                    style={styles.removeOptionButton}
                    onPress={() => removeQuizOption(questionIndex, optionIndex)}
                    accessibilityLabel={`Remove option ${optionIndex + 1}`}
                  >
                    <Text style={styles.removeOptionButtonText}>✕ Remove</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}
            <TouchableOpacity style={styles.addOptionButton} onPress={() => addQuizOption(questionIndex)}><Text style={styles.addOptionText}>+ Add answer option</Text></TouchableOpacity>
          </View>
        ))}
        <TouchableOpacity style={styles.addQuestionButton} onPress={addQuizQuestion}><Text style={styles.buttonText}>+ Add question</Text></TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={saveQuiz}><Text style={styles.buttonText}>Save Quiz</Text></TouchableOpacity>
        <Text style={styles.listHeader}>Created Quizzes</Text>
        {topics.filter((topic) => topic.quiz_id !== null).map((topic) => (
          <View key={topic.quiz_id} style={styles.quizRow}>
            <View style={styles.topicDetails}>
              <View style={styles.topicTitleRow}>
                <Text style={styles.topicTitle}>{topic.quiz_title}</Text>
                <View style={styles.idBadge}>
                  <Text style={styles.idBadgeText}>Quiz ID: {topic.quiz_id}</Text>
                </View>
              </View>
              <Text style={styles.topicType}>Attached to: {topic.title} (Topic ID: {topic.id})</Text>
            </View>
            <View style={styles.topicActions}>
              <TouchableOpacity style={styles.editButton} onPress={() => void editQuiz(topic)}>
                <Text style={styles.editButtonText}>Edit Quiz</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.deleteButton} onPress={() => confirmRemoveQuiz(topic)}>
                <Text style={styles.deleteButtonText}>Remove Quiz</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 28, paddingTop: 92, maxWidth: 760, alignSelf: 'center', width: '100%', backgroundColor: '#F8F7FC', borderRadius: 18, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.75)', borderTopWidth: 3, borderTopColor: '#a84bab', marginTop: 16, marginBottom: 28, shadowColor: '#0f0a1e', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.22, shadowRadius: 24, elevation: 4 },
  header: { fontSize: 26, fontWeight: '800', marginBottom: 20, color: '#412653' },
  label: { fontWeight: '700', color: '#3f567f', marginBottom: 8 },
  input: { borderWidth: 1, borderColor: '#e2dce8', backgroundColor: '#ffffff', color: '#242432', borderRadius: 9, padding: 12, marginBottom: 12 },
  parentOptions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  parentOption: { borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 6, padding: 10 },
  parentOptionSelected: { backgroundColor: '#f7edf7', borderColor: '#a84bab' },
  parentOptionText: { color: '#242432' },
  textArea: { height: 120, textAlignVertical: 'top' },
  previewTitle: { fontWeight: 'bold', color: '#412653', marginTop: 8, marginBottom: 12 },
  previewContent: { color: '#334155', lineHeight: 24, marginBottom: 12 },
  youtubePreview: { width: '50%', aspectRatio: 16 / 9, alignSelf: 'center', borderRadius: 6, marginBottom: 12 },
  button: { backgroundColor: '#e0563f', padding: 14, borderRadius: 9, alignItems: 'center' },
  buttonText: { color: '#ffffff', fontWeight: 'bold' },
  cancelButton: { borderWidth: 1, borderColor: '#94a3b8', padding: 12, borderRadius: 6, alignItems: 'center', marginTop: 8 },
  cancelButtonText: { color: '#334155', fontWeight: '600' },
  listHeader: { fontSize: 21, fontWeight: '800', color: '#412653', marginTop: 32, marginBottom: 12 },
  topicRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: '#e6e1eb', borderRadius: 9, padding: 12, marginBottom: 8, backgroundColor: '#FAFAFC' },
  topicDetails: { flex: 1, marginRight: 12 },
  topicActions: { flexDirection: 'row', gap: 8 },
  topicTitleRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 8 },
  idBadge: { backgroundColor: '#f1f5f9', borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 },
  idBadgeText: { fontSize: 11, fontWeight: '700', color: '#475569', fontFamily: 'monospace' },
  topicTitle: { fontWeight: '600', color: '#0f172a' },
  subtopicTitle: { paddingLeft: 16, color: '#334155' },
  topicType: { color: '#64748b', fontSize: 12, marginTop: 4 },
  editButton: { backgroundColor: '#3f567f', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 7 },
  editButtonText: { color: '#ffffff', fontWeight: '600' },
  deleteButton: { backgroundColor: '#dc2626', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 6 },
  deleteButtonText: { color: '#ffffff', fontWeight: '600' },
  imagePicker: { marginBottom: 12 },
  imagePreview: { width: '100%', borderRadius: 6, marginBottom: 12, backgroundColor: '#f1f5f9' },
  imageEditorRow: { borderWidth: 1, borderColor: '#e6e1eb', borderRadius: 9, padding: 12, marginBottom: 12, backgroundColor: '#FAFAFC' },
  imageLabel: { fontWeight: '600', color: '#334155', marginBottom: 8 },
  quizBuilder: { marginTop: 32, borderTopWidth: 1, borderTopColor: '#cbd5e1', paddingTop: 20 },
  questionEditor: { borderWidth: 1, borderColor: '#e6e1eb', borderRadius: 9, padding: 12, marginBottom: 12, backgroundColor: '#F0EEF6' },
  quizRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: '#e6e1eb', borderRadius: 9, padding: 12, marginBottom: 8, backgroundColor: '#FAFAFC' },
  questionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  questionEditorTitle: { fontSize: 16, fontWeight: 'bold', color: '#0f172a' },
  removeQuestionButton: { borderWidth: 1, borderColor: '#fca5a5', backgroundColor: '#fef2f2', paddingVertical: 4, paddingHorizontal: 10, borderRadius: 6 },
  removeQuestionButtonText: { color: '#dc2626', fontWeight: '600', fontSize: 12 },
  pointsInput: { borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 6, padding: 10, marginBottom: 10, width: 100 },
  optionEditor: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  optionInput: { flex: 1, borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 6, padding: 10 },
  correctSelector: { borderWidth: 1, borderColor: '#94a3b8', borderRadius: 6, paddingVertical: 10, paddingHorizontal: 8 },
  correctSelectorActive: { backgroundColor: '#dcfce7', borderColor: '#16a34a' },
  correctSelectorText: { color: '#334155', fontSize: 12 },
  correctSelectorTextActive: { color: '#15803d', fontWeight: '600' },
  removeOptionButton: { borderWidth: 1, borderColor: '#fca5a5', backgroundColor: '#fef2f2', paddingVertical: 10, paddingHorizontal: 10, borderRadius: 6, justifyContent: 'center', alignItems: 'center' },
  removeOptionButtonText: { color: '#dc2626', fontWeight: '600', fontSize: 12 },
  addOptionButton: { paddingVertical: 8 },
  addOptionText: { color: '#a84bab', fontWeight: '600' },
  addQuestionButton: { backgroundColor: '#475569', padding: 12, borderRadius: 6, alignItems: 'center', marginBottom: 8 },
  imagePositionOptions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  imagePositionOption: { borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 6, paddingVertical: 8, paddingHorizontal: 12 },
  imagePositionOptionSelected: { backgroundColor: '#f7edf7', borderColor: '#a84bab' },
  imagePositionText: { color: '#1e293b' },
  removeImageButton: { borderWidth: 1, borderColor: '#dc2626', padding: 10, borderRadius: 6, alignItems: 'center', marginBottom: 12 },
  removeImageButtonText: { color: '#dc2626', fontWeight: '600' },
  topicThumbnail: { width: 64, height: 48, borderRadius: 4, marginBottom: 6, resizeMode: 'cover' }
});