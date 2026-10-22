const fs = require('fs'); const file = 'e:/LearningWebsite/frontend/src/screens/AdminPage.tsx'; let content = fs.readFileSync(file, 'utf8'); content = content.replace(/return \\([\\s\\S]*?\\);\\s*}\\s*const styles = StyleSheet\\.create\\(\\{/, \eturn (
    <View style={styles.pageLayout}>
      <View style={styles.sidebar}>
        <ScrollView contentContainerStyle={styles.sidebarScroll}>
          <Text style={styles.sidebarHeader}>Created Topics</Text>
          {topics.map((topic) => (
            <View key={topic.id} style={styles.topicRow}>
              <View style={styles.topicDetails}>
                {topic.image_url && <Image source={{ uri: \\\\\\\\\\\\\\\\\\\\ }} style={styles.topicThumbnail} />}
                <View style={styles.topicTitleRow}>
                  <Text style={[styles.topicTitle, topic.parent_topic_id !== null && styles.subtopicTitle]}>
                    {topic.parent_topic_id !== null ? \\\\\- \\\\\\\\\\ : topic.title}
                  </Text>
                  <View style={styles.idBadge}>
                    <Text style={styles.idBadgeText}>ID: {topic.id}</Text>
                  </View>
                </View>
                <Text style={styles.topicType}>
                  {topic.parent_topic_id !== null ? \\\\\Subtopic • Parent ID: \\\\\\\\\\ : 'Top-level Topic'}
                  {topic.quiz_id ? \\\\\ • Quiz ID: \\\\\\\\\\ : ' • No Quiz'}
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
          
          <Text style={[styles.sidebarHeader, { marginTop: 32 }]}>Created Quizzes</Text>
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
        </ScrollView>
      </View>
      <View style={styles.mainArea}>
        <ScrollView contentContainerStyle={styles.container}>
          <Text style={styles.header}>{editingTopicId === null ? 'Create New Lesson Topic' : \\\\\Edit Lesson Topic (ID: \\\\\)\\\\\}</Text>
          <View style={styles.row}>
            <View style={styles.flex1}>
              <Text style={styles.label}>Topic Title</Text>
              <TextInput 
                placeholder=\
Topic
Title\ 
                style={styles.input} 
                value={title} 
                onChangeText={setTitle} 
              />
            </View>
            <View style={styles.flex1}>
              <Text style={styles.label}>Slug (e.g. intro)</Text>
              <TextInput 
                placeholder=\Slug\ 
                style={styles.input} 
                value={slug} 
                onChangeText={setSlug} 
              />
            </View>
          </View>
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
            placeholder=\Paste
a
YouTube
link\
            style={styles.input}
            value={youtubeUrl}
            onChangeText={setYoutubeUrl}
            autoCapitalize=\none\
          />
          {getYouTubeId(youtubeUrl) && (
            <Image
              source={{ uri: \\\\\https://img.youtube.com/vi/\\\\\/hqdefault.jpg\\\\\ }}
              style={styles.youtubePreview}
              resizeMode=\contain\
            />
          )}
          <View style={styles.row}>
            <View style={styles.flex1}>
              <Text style={styles.label}>Title Size: {titleTextSize}px</Text>
              <input type=\range\ min=\16\ max=\64\ step=\1\ value={titleTextSize} onChange={(event) => setTitleTextSize(Number(event.target.value))} style={{ width: '100%', marginBottom: 8 }} />
              <Text style={[styles.previewTitle, { fontSize: titleTextSize }]} numberOfLines={1}>Preview: {title || 'Topic title'}</Text>
            </View>
            <View style={styles.flex1}>
              <Text style={styles.label}>Content Size: {contentTextSize}px</Text>
              <input type=\range\ min=\12\ max=\32\ step=\1\ value={contentTextSize} onChange={(event) => setContentTextSize(Number(event.target.value))} style={{ width: '100%', marginBottom: 8 }} />
              <Text style={[styles.previewContent, { fontSize: contentTextSize }]} numberOfLines={1}>Content preview text...</Text>
            </View>
          </View>
          {Platform.OS === 'web' && (
            <View style={styles.imagePicker}>
              <Text style={styles.label}>Topic Images (optional, up to 10 images, max 5 MB each)</Text>
              <input type=\file\ accept=\image/*\ multiple onChange={handleImageChange} />
            </View>
          )}
          {existingImages.map((image) => (
            <View key={image.id} style={styles.imageEditorRow}>
              <Image source={{ uri: \\\\\\\\\\\\\\\\\\\\ }} style={styles.imagePreview} resizeMode=\contain\ />
              <Text style={styles.imageLabel}>Existing Image</Text>
              {renderPositionPicker(image.image_position, (position) => updateExistingImagePosition(image.id, position))}
              <Text style={styles.imageLabel}>Image Size: {image.image_width}%</Text>
              <input type=\range\ min=\25\ max=\100\ step=\5\ value={image.image_width} onChange={(event) => updateExistingImageWidth(image.id, Number(event.target.value))} />
              <TouchableOpacity style={styles.removeImageButton} onPress={() => removeExistingImage(image.id)}>
                <Text style={styles.removeImageButtonText}>Remove This Image</Text>
              </TouchableOpacity>
            </View>
          ))}
          {newImages.map((image, index) => (
            <View key={image.preview} style={styles.imageEditorRow}>
              <Image source={{ uri: image.preview }} style={styles.imagePreview} resizeMode=\contain\ />
              <Text style={styles.imageLabel}>New Image</Text>
              {renderPositionPicker(image.position, (position) => updateNewImagePosition(index, position))}
              <Text style={styles.imageLabel}>Image Size: {image.width}%</Text>
              <input type=\range\ min=\25\ max=\100\ step=\5\ value={image.width} onChange={(event) => updateNewImageWidth(index, Number(event.target.value))} />
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
          <View style={styles.quizBuilder}>
            <Text style={styles.listHeader}>Quiz Maker</Text>
            <Text style={styles.label}>Attach quiz to topic</Text>
            <View style={styles.parentOptions}>
              {topics.map((topic) => (
                <TouchableOpacity key={topic.id} style={[styles.parentOption, quizTopicId === topic.id && styles.parentOptionSelected]} onPress={() => setQuizTopicId(topic.id)}>
                  <Text style={styles.parentOptionText}>
                    {topic.parent_topic_id !== null ? \\\\\↳ \\\\\\\\\\ : topic.title} (ID: {topic.id})
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <TextInput placeholder=\Quiz
title\ style={styles.input} value={quizTitle} onChangeText={setQuizTitle} />
            <Text style={styles.label}>Passing score: {passingScore}%</Text>
            <input type=\range\ min=\0\ max=\100\ step=\5\ value={passingScore} onChange={(event) => setPassingScore(Number(event.target.value))} />
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
                <View style={[styles.row, { marginBottom: 12 }]}>
                  <View style={[styles.flex1, { flex: 3 }]}>
                    <TextInput placeholder=\Question
text\ style={[styles.input, { marginBottom: 0 }]} value={question.questionText} onChangeText={(text) => updateQuizQuestion(questionIndex, { questionText: text })} />
                  </View>
                  <View style={[styles.flex1, { flex: 1 }]}>
                    <TextInput placeholder=\Points\ style={[styles.input, { marginBottom: 0 }]} keyboardType=\numeric\ value={String(question.points)} onChangeText={(value) => updateQuizQuestion(questionIndex, { points: Number(value) || 1 })} />
                  </View>
                </View>
                {question.options.map((option, optionIndex) => (
                  <View key={optionIndex} style={styles.optionEditor}>
                    <TouchableOpacity style={[styles.correctSelector, option.isCorrect && styles.correctSelectorActive]} onPress={() => setCorrectOption(questionIndex, optionIndex)}>
                      <Text style={[styles.correctSelectorText, option.isCorrect && styles.correctSelectorTextActive]}>{option.isCorrect ? 'Correct' : 'Set correct'}</Text>
                    </TouchableOpacity>
                    <TextInput placeholder={\\\\\Answer option \\\\\\\\\\} style={styles.optionInput} value={option.text} onChangeText={(text) => updateQuizOption(questionIndex, optionIndex, text)} />
                    {question.options.length > 2 && (
                      <TouchableOpacity
                        style={styles.removeOptionButton}
                        onPress={() => removeQuizOption(questionIndex, optionIndex)}
                        accessibilityLabel={\\\\\Remove option \\\\\\\\\\}
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
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  pageLayout: { flexDirection: 'row', flex: 1, height: '100vh', backgroundColor: '#f1f5f9' },
  sidebar: { width: 380, borderRightWidth: 1, borderRightColor: '#e2e8f0', backgroundColor: '#ffffff', height: '100vh' },
  sidebarScroll: { padding: 20 },
  sidebarHeader: { fontSize: 20, fontWeight: 'bold', marginBottom: 16, color: '#0f172a' },
  mainArea: { flex: 1, height: '100vh' },
\\n); fs.writeFileSync(file, content); console.log('Replacement done.');
