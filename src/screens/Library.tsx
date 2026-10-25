import { StoryArt } from '../components/Motion';
import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  ImageBackground,
  Pressable,
  Alert,
  ScrollView,
} from 'react-native';
import { GradientSurface as LinearGradient } from '../components/GradientSurface';
import { launchImageLibrary } from 'react-native-image-picker';
import { assets } from '../assets';
import {
  Button,
  Chips,
  Empty,
  Field,
  Header,
  Progress,
  Screen,
  Stat,
} from '../components/UI';
import {
  Book,
  collections,
  Collection,
  uid,
  useStore,
} from '../store/AppStore';
import { colors, styles as s } from '../theme';
import { Props, TabProps } from '../navigation/types';
const genres = [
  'Literary',
  'Fantasy',
  'Classic',
  'Sci-Fi',
  'Gothic',
  'Mythology',
  'Mystery',
  'Romance',
  'Nonfiction',
  'Other',
];
const coverColors = [
  '#A21BC2',
  '#007CAD',
  '#AB247B',
  '#278E74',
  '#CA651B',
  '#B58C24',
  '#6542B5',
  '#358EB2',
  '#992F13',
  '#A47297',
];
export function Cover({
  book,
  large = false,
}: {
  book: Pick<Book, 'cover' | 'color' | 'title' | 'author'>;
  large?: boolean;
}) {
  return book.cover ? (
    <Image
      source={{ uri: book.cover }}
      style={{
        width: large ? 148 : 55,
        height: large ? 214 : 80,
        borderRadius: 8,
      }}
    />
  ) : (
    <LinearGradient
      colors={['#321664', book.color]}
      style={{
        width: large ? 148 : 55,
        height: large ? 214 : 80,
        borderRadius: 8,
        padding: large ? 13 : 5,
      }}
    >
      <Text
        numberOfLines={4}
        style={{
          fontFamily: 'Georgia',
          color: 'white',
          fontSize: large ? 22 : 9,
        }}
      >
        {book.title}
      </Text>
      <Text
        numberOfLines={2}
        style={{ fontSize: large ? 10 : 6, color: '#E1CBE7', marginTop: 6 }}
      >
        {book.author.toUpperCase()}
      </Text>
    </LinearGradient>
  );
}
export function LibraryScreen({ navigation }: TabProps<'Library'>) {
  const { state } = useStore();
  const [search, setSearch] = useState('');
  const [collection, setCollection] = useState<Collection>('Currently Reading');
  const [genre, setGenre] = useState('All');
  const list = state.books.filter(
    b =>
      (search
        ? `${b.title} ${b.author} ${b.genre}`
            .toLowerCase()
            .includes(search.toLowerCase())
        : b.collection === collection) &&
      (genre === 'All' || b.genre === genre),
  );
  const current = state.books.find(b => b.collection === 'Currently Reading');
  return (
    <Screen>
      <Header
        title="Library"
        subtitle="Bully Tales · Your reading corner"
        action={
          <Button title="＋" onPress={() => navigation.navigate('BookForm')} />
        }
      />
      <Text style={[s.small, { marginTop: -15, marginBottom: 15 }]}>
        {state.books.length} books ·{' '}
        {
          state.books.filter(
            b =>
              b.collection === 'Read' &&
              b.finishedAt?.startsWith(String(new Date().getFullYear())),
          ).length
        }{' '}
        finished this year
      </Text>
      <Field
        placeholder="⌕  Search title, author or genre"
        value={search}
        onChangeText={setSearch}
      />
      {current && !search && (
        <Pressable
          onPress={() => navigation.navigate('BookDetails', { id: current.id })}
          style={[s.card, { marginTop: 16, backgroundColor: '#174D99' }]}
        >
          <View style={s.row}>
            <Cover book={current} />
            <View style={{ flex: 1, gap: 5 }}>
              <Text style={s.label}>Continue reading</Text>
              <Text style={s.heading}>{current.title}</Text>
              <Text style={s.small}>{current.author}</Text>
              <Progress value={(current.current / current.pages) * 100} />
              <Text style={s.small}>
                Page {current.current} of {current.pages}
              </Text>
            </View>
            <StoryArt
              source={assets.logo}
              style={{ width: 40, height: 40, borderRadius: 20 }}
            />
          </View>
        </Pressable>
      )}
      <View style={s.section}>
        <View style={s.between}>
          <Text style={s.heading}>Collections</Text>
          <Text style={s.small}>Tap to browse</Text>
        </View>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
          {collections.map((c, i) => (
            <Pressable
              key={c}
              onPress={() => {
                setCollection(c);
                setSearch('');
              }}
              style={{
                width: '48%',
                flexGrow: 1,
                borderRadius: 19,
                overflow: 'hidden',
                borderWidth: 2,
                borderColor: collection === c ? '#FFD166' : 'transparent',
              }}
            >
              <ImageBackground
                source={assets.collections[i]}
                style={{
                  padding: 13,
                  minHeight: 108,
                  justifyContent: 'space-between',
                }}
              >
                <Text
                  style={{ color: 'white', fontSize: 13, fontWeight: '600' }}
                >
                  {c}
                </Text>
                <Text style={{ color: '#F0DFF4', fontSize: 11 }}>
                  {state.books.filter(b => b.collection === c).length} books
                </Text>
              </ImageBackground>
            </Pressable>
          ))}
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <Chips
            options={['All', ...genres]}
            value={genre}
            onChange={setGenre}
          />
        </ScrollView>
        <View style={s.between}>
          <Text style={s.heading}>
            {search ? `Results for “${search}”` : collection}
          </Text>
          <Text style={s.small}>{list.length} books</Text>
        </View>
        {list.length === 0 ? (
          <Empty
            title="No books here yet"
            description="Bully Tales is waiting for a new story."
            action={
              <Button
                title="Add a book"
                onPress={() => navigation.navigate('BookForm')}
              />
            }
          />
        ) : (
          list.map(book => (
            <Pressable
              key={book.id}
              onPress={() =>
                navigation.navigate('BookDetails', { id: book.id })
              }
              style={[s.card, s.row, { padding: 12 }]}
            >
              <Cover book={book} />
              <View style={{ flex: 1, gap: 5 }}>
                <Text style={[s.heading, { fontSize: 15 }]}>{book.title}</Text>
                <Text style={s.small}>{book.author}</Text>
                <Text style={s.small}>
                  {book.genre}{' '}
                  <Text style={{ color: '#EABD59' }}>
                    {'★'.repeat(book.rating)}
                  </Text>
                </Text>
                <Progress value={(book.current / book.pages) * 100} />
              </View>
              <Text style={s.body}>›</Text>
            </Pressable>
          ))
        )}
      </View>
    </Screen>
  );
}
export function BookDetails({ route, navigation }: Props<'BookDetails'>) {
  const { state, update } = useStore();
  const book = state.books.find(b => b.id === route.params.id);
  if (!book)
    return (
      <Screen>
        <Header title="Book unavailable" back={() => navigation.goBack()} />
      </Screen>
    );
  const patch = (value: Partial<Book>) =>
    update(st => ({
      ...st,
      books: st.books.map(b => (b.id === book.id ? { ...b, ...value } : b)),
    }));
  const remove = () =>
    Alert.alert(
      `Delete “${book.title}”?`,
      'This book, its notes and reading progress will be removed from your library.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            update(st => ({
              ...st,
              books: st.books.filter(b => b.id !== book.id),
            }));
            navigation.goBack();
          },
        },
      ],
    );
  return (
    <Screen>
      <Header
        title="Book Details"
        back={() => navigation.goBack()}
        action={
          <Button
            title="Edit"
            secondary
            onPress={() => navigation.navigate('BookForm', { id: book.id })}
          />
        }
      />
      <View style={[s.center, { gap: 12 }]}>
        <Cover book={book} large />
        <Text style={[s.title, { fontFamily: 'Georgia', textAlign: 'center' }]}>
          {book.title}
        </Text>
        <Text style={s.body}>{book.author}</Text>
        <Text style={s.label}>
          {book.genre} · {book.collection}
        </Text>
      </View>
      <View style={[s.row, { marginTop: 24 }]}>
        <Stat label="PAGES" value={String(book.pages)} />
        <Stat label="RATING" value={`★ ${book.rating || '—'}`} />
        <Stat
          label="PROGRESS"
          value={`${Math.round((book.current / book.pages) * 100)}%`}
        />
      </View>
      <View style={[s.card, s.section]}>
        <View style={s.between}>
          <Text style={s.heading}>Reading progress</Text>
          <Text style={s.small}>
            Page {book.current} / {book.pages}
          </Text>
        </View>
        <Progress value={(book.current / book.pages) * 100} />
        <View style={s.row}>
          {[-10, 1, 10].map(n => (
            <View key={n} style={{ flex: 1 }}>
              <Button
                title={n > 0 ? `+${n}` : String(n)}
                secondary={n !== 10}
                onPress={() =>
                  patch({
                    current: Math.max(
                      0,
                      Math.min(book.pages, book.current + n),
                    ),
                  })
                }
              />
            </View>
          ))}
        </View>
      </View>
      <View style={s.section}>
        <Text style={s.label}>Move to</Text>
        <Chips
          options={collections}
          value={book.collection}
          onChange={c =>
            patch({
              collection: c,
              finishedAt: c === 'Read' ? new Date().toISOString() : undefined,
              current: c === 'Read' ? book.pages : book.current,
            })
          }
        />
        <Text style={s.label}>About</Text>
        <Text style={s.body}>
          {book.description || 'No description added.'}
        </Text>
        <Text style={s.label}>My notes</Text>
        <View style={s.card}>
          <Text style={s.body}>
            {book.notes || 'Add your thoughts using Edit.'}
          </Text>
        </View>
        <Text style={s.small}>
          Added {new Date(book.createdAt).toLocaleDateString()}
        </Text>
        <Button title="Delete Book" secondary danger onPress={remove} />
      </View>
    </Screen>
  );
}
export function BookForm({ route, navigation }: Props<'BookForm'>) {
  const { state, update } = useStore();
  const existing = state.books.find(b => b.id === route.params?.id);
  const [title, setTitle] = useState(existing?.title || '');
  const [author, setAuthor] = useState(existing?.author || '');
  const [pages, setPages] = useState(existing ? String(existing.pages) : '');
  const [current, setCurrent] = useState(
    existing ? String(existing.current) : '0',
  );
  const [genre, setGenre] = useState(existing?.genre || 'Fantasy');
  const [collection, setCollection] = useState<Collection>(
    existing?.collection || 'Currently Reading',
  );
  const [rating, setRating] = useState(existing?.rating || 0);
  const [description, setDescription] = useState(existing?.description || '');
  const [notes, setNotes] = useState(existing?.notes || '');
  const [color, setColor] = useState(existing?.color || coverColors[0]);
  const [cover, setCover] = useState(existing?.cover);
  const [error, setError] = useState('');
  const upload = async () => {
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        includeBase64: true,
        maxWidth: 700,
        maxHeight: 1000,
        quality: 0.8,
      });
      if (result.errorCode) throw Error(result.errorMessage);
      const a = result.assets?.[0];
      if (a?.base64)
        setCover(`data:${a.type || 'image/jpeg'};base64,${a.base64}`);
    } catch {
      Alert.alert('Image unavailable', 'Please try selecting another photo.');
    }
  };
  const save = () => {
    if (!title.trim() || !author.trim())
      return setError('Please enter a title and author.');
    if (
      !Number.isInteger(Number(pages)) ||
      Number(pages) < 1 ||
      !Number.isInteger(Number(current)) ||
      Number(current) < 0 ||
      Number(current) > Number(pages)
    )
      return setError(
        'Enter a valid page count and current page from 0 to total pages.',
      );
    const book: Book = {
      id: existing?.id || uid(),
      title: title.trim(),
      author: author.trim(),
      pages: Number(pages),
      current: collection === 'Read' ? Number(pages) : Number(current),
      genre,
      collection,
      rating,
      description: description.trim(),
      notes: notes.trim(),
      color,
      cover,
      createdAt: existing?.createdAt || new Date().toISOString(),
      finishedAt:
        collection === 'Read'
          ? existing?.finishedAt || new Date().toISOString()
          : undefined,
    };
    update(st => ({
      ...st,
      books: existing
        ? st.books.map(b => (b.id === book.id ? book : b))
        : [book, ...st.books],
    }));
    navigation.goBack();
  };
  return (
    <Screen>
      <Header
        title={existing ? 'Edit Book' : 'New Book'}
        back={() => navigation.goBack()}
      />
      <View style={[s.row, { alignItems: 'flex-start', marginBottom: 20 }]}>
        <Cover book={{ title, author, color, cover }} />
        <View style={{ flex: 1, gap: 12 }}>
          <Button title="↥ Upload image" secondary onPress={upload} />
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
            {coverColors.map(c => (
              <Pressable
                key={c}
                onPress={() => {
                  setColor(c);
                  setCover(undefined);
                }}
                accessibilityLabel={`Cover ${c}`}
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 20,
                  backgroundColor: c,
                  borderWidth: color === c ? 2 : 0,
                  borderColor: 'white',
                }}
              />
            ))}
          </View>
        </View>
      </View>
      <View style={{ gap: 16 }}>
        <Field
          label="Title *"
          value={title}
          onChangeText={setTitle}
          placeholder="Book title"
        />
        <Field
          label="Author *"
          value={author}
          onChangeText={setAuthor}
          placeholder="Author name"
        />
        <Text style={s.small}>Genre</Text>
        <Chips options={genres} value={genre} onChange={setGenre} />
        <View style={s.row}>
          <View style={{ flex: 1 }}>
            <Field
              label="Page count *"
              keyboardType="number-pad"
              value={pages}
              onChangeText={setPages}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Field
              label="Current page"
              keyboardType="number-pad"
              value={current}
              onChangeText={setCurrent}
            />
          </View>
        </View>
        <Text style={s.small}>Rating</Text>
        <View style={s.row}>
          {[1, 2, 3, 4, 5].map(n => (
            <Pressable
              key={n}
              accessibilityLabel={`${n} stars`}
              onPress={() => setRating(rating === n ? 0 : n)}
            >
              <Text
                style={{
                  fontSize: 32,
                  color: n <= rating ? '#EABD59' : '#655C81',
                }}
              >
                {n <= rating ? '★' : '☆'}
              </Text>
            </Pressable>
          ))}
        </View>
        <Text style={s.small}>Collection</Text>
        <Chips
          options={collections}
          value={collection}
          onChange={setCollection}
        />
        <Field
          label="Description"
          multiline
          value={description}
          onChangeText={setDescription}
          placeholder="What’s it about?"
        />
        <Field
          label="My notes"
          multiline
          value={notes}
          onChangeText={setNotes}
          placeholder="Quotes, thoughts, who recommended it…"
        />
        {!!error && (
          <Text accessibilityRole="alert" style={{ color: colors.danger }}>
            {error}
          </Text>
        )}
        <Button title="Save Book" onPress={save} />
      </View>
    </Screen>
  );
}
