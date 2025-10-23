import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  IconButton,
  TextField,
  InputAdornment,
  Pagination,
  CircularProgress,
  Alert,
  Skeleton,
  Snackbar,
  TablePagination
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
  Search as SearchIcon,
  FilterList as FilterIcon
} from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { petService, Pet } from '../../services/petService';
import PetNameWithIcons from '../../components/pets/PetNameWithIcons';
import { debounce } from 'lodash';



const PAGE_SIZE = 10;

const Pets = () => {
  const navigate = useNavigate();
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const [page, setPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [initialLoad, setInitialLoad] = useState(true);


  const loadPets = useCallback(async (pageNum: number, search: string) => {
    try {
      setLoading(true);
      const response = await petService.getAllPets(pageNum + 1, PAGE_SIZE, search);
      setPets(response.data);
      setTotalCount(response.results);
      setError(null);
    } catch (err) {
      console.error('Error loading pets:', err);
      setError('Failed to load pets');
      setPets([]);
    } finally {
      setLoading(false);
      if (initialLoad) setInitialLoad(false);
    }
  }, [initialLoad]);

  const debouncedSearch = useMemo(
    () => debounce((value: string) => {
      setPage(0);
      loadPets(0, value);
    }, 500),
    [loadPets]
  );

  useEffect(() => {
    loadPets(page, searchTerm);
  }, [page, searchTerm, loadPets]);

  useEffect(() => {
    if (!initialLoad) {
      debouncedSearch(searchTerm);
    }
    return () => debouncedSearch.cancel();
  }, [searchTerm, initialLoad, debouncedSearch]);

  const handleRowClick = (id: string) => {
    navigate(`/pets/${id}`);
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); // Prevent row click
    if (window.confirm('Are you sure you want to permanently delete this pet? This action cannot be undone.')) {
      try {
        await petService.deletePet(id);
        
        // Refresh the pet list after deletion
        const response = await petService.getAllPets(page + 1, PAGE_SIZE, searchTerm);
        setPets(response.data);
        setTotalCount(response.results);
        
        setSnackbar({
          open: true,
          message: 'Pet permanently deleted',
          severity: 'success'
        });
      } catch (err) {
        console.error('Error deleting pet:', err);
        setSnackbar({
          open: true,
          message: 'Error deleting pet. Please try again.',
          severity: 'error'
        });
        
        // Refresh list to ensure UI is in sync with backend
        const response = await petService.getAllPets(page + 1, PAGE_SIZE, searchTerm);
        if (!response?.data || !Array.isArray(response.data)) {
          throw new Error('Invalid response format');
        }
        setPets(response.data);
        setTotalCount(response.results);
      }
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" gutterBottom>
            Pets
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate('/pets/new')}
          >
            Add New Pet
          </Button>
        </Box>

        <Box sx={{ mb: 2 }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search pets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {loading && initialLoad ? (
          <Box sx={{ mb: 2 }}>
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} height={53} sx={{ mb: 1 }} />
            ))}
          </Box>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Breed</TableCell>
                  <TableCell>Gender</TableCell>
                  <TableCell>Weight</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {pets.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      No pets registered
                    </TableCell>
                  </TableRow>
                ) : (
                  pets.map(pet => (
                    <TableRow
                      key={pet.id}
                      sx={{ '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' } }}
                    >
                      <TableCell onClick={() => handleRowClick(pet.id)} sx={{ cursor: 'pointer' }}>
                        <PetNameWithIcons
                          petName={pet.name}
                          petIcons={pet.petIcons}
                          iconNotes={pet.iconNotes}
                          petType={pet.type}
                          profilePhoto={pet.profilePhoto}
                          size="small"
                          nameVariant="body2"
                          showPhoto={true}
                        />
                      </TableCell>
                      <TableCell onClick={() => handleRowClick(pet.id)} sx={{ cursor: 'pointer' }}>
                        {pet.type}
                      </TableCell>
                      <TableCell onClick={() => handleRowClick(pet.id)} sx={{ cursor: 'pointer' }}>
                        {pet.breed || 'N/A'}
                      </TableCell>
                      <TableCell onClick={() => handleRowClick(pet.id)} sx={{ cursor: 'pointer' }}>
                        {pet.gender || 'N/A'}
                      </TableCell>
                      <TableCell onClick={() => handleRowClick(pet.id)} sx={{ cursor: 'pointer' }}>
                        {pet.weight ? `${pet.weight} lbs` : 'N/A'}
                      </TableCell>
                      <TableCell align="right">
                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() => navigate(`/pets/${pet.id}`)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="outlined"
                            color="error"
                            size="small"
                            onClick={(e) => handleDelete(e, pet.id)}
                          >
                            Delete
                          </Button>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {!loading && !error && (
          <TablePagination
            component="div"
            count={totalCount}
            page={page}
            onPageChange={(_, newPage) => setPage(newPage)}
            rowsPerPage={PAGE_SIZE}
            rowsPerPageOptions={[PAGE_SIZE]}
          />
        )}
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      >
        <Alert
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Pets;
